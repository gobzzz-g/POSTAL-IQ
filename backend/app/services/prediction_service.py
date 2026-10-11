import time
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.schemas.prediction import (
    PredictionRequest, PredictionResponse, CandidateMatch,
    ExtractedEntities, EvidenceItem
)
from backend.app.models.history import SearchHistory
from backend.app.ml.preprocessing.normalizer import normalizer
from backend.app.ml.entity_extraction.extractor import extractor
from backend.app.ml.candidate_retrieval.retriever import candidate_retriever
from backend.app.ml.ranking.ranker import candidate_ranker
from backend.app.ml.confidence.calibrator import calibrate_candidate_confidence
from backend.app.ml.explainability.explainer import explainer
from backend.app.core.config import settings

class PredictionService:
    def predict_address(self, db: Session, req: PredictionRequest) -> PredictionResponse:
        start_time = time.perf_counter()
        raw_text = req.address_text.strip() if req.address_text else ""

        # Step 1: Input Validation - reject empty or malformed inputs early
        if not raw_text or len(raw_text) < 3 or not any(c.isalnum() for c in raw_text):
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            resp = PredictionResponse(
                status="invalid_input",
                query_original=raw_text,
                query_normalized="",
                extracted_entities=ExtractedEntities(),
                primary_match=None,
                alternatives=[],
                clarification=None,
                overall_confidence=0.0,
                confidence_level="none",
                warnings=["Address input cannot be empty or malformed. Please enter a valid address."],
                model_version=candidate_ranker.model_version_tag,
                dataset_version="IndiaPost-2024.1",
                ranking_mode="validation_guard",
                latency_ms=latency_ms
            )
            self._save_history(db, req.session_id, raw_text, "invalid_input", None, None, 0.0)
            return resp

        # If user answered a clarification question
        augmented_text = raw_text
        if req.clarification_answer:
            augmented_text = f"{raw_text}, {req.clarification_answer}"

        # Step 2: Normalization
        normalized_text, corrections = normalizer.normalize(augmented_text)

        # Step 3: Entity Extraction
        entities = extractor.extract(normalized_text)
        if req.explicit_pin:
            entities["pin_code"] = req.explicit_pin

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        extracted_model = ExtractedEntities(
            locality=entities.get("locality"),
            city_or_town=entities.get("city_or_town"),
            district=entities.get("district"),
            state=entities.get("state"),
            pin_code=entities.get("pin_code"),
            landmarks=entities.get("landmarks", []),
            corrections_applied=corrections
        )

        # Step 3b: Explicit Geographic Conflict Detection
        if entities.get("has_geographic_conflict"):
            conflict_msg = entities.get("conflict_details") or "Explicit geographic conflict detected between locality and specified district/state."
            resp = PredictionResponse(
                status="conflict",
                query_original=raw_text,
                query_normalized=normalized_text,
                extracted_entities=extracted_model,
                primary_match=None,
                alternatives=[],
                clarification=None,
                overall_confidence=0.0,
                confidence_level="none",
                warnings=[conflict_msg],
                model_version=candidate_ranker.model_version_tag,
                dataset_version="IndiaPost-2024.1",
                ranking_mode="conflict_guard",
                latency_ms=latency_ms
            )
            self._save_history(db, req.session_id, raw_text, "conflict", None, None, 0.0)
            return resp

        # Step 4: Candidate Retrieval
        retrieved_candidates = candidate_retriever.retrieve(db, normalized_text, entities, top_k=10)

        # Step 5: Candidate Ranking
        ranked_candidates = candidate_ranker.rank_candidates(normalized_text, entities, retrieved_candidates)

        # Step 6: Confidence Calibration
        calibrated_candidates = calibrate_candidate_confidence(ranked_candidates, entities)

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Step 7: Safe No-Match Outcome if candidate evidence is insufficient
        if not calibrated_candidates or calibrated_candidates[0]["calibrated_confidence"] < settings.CONFIDENCE_MIN_THRESHOLD or calibrated_candidates[0]["raw_match_score"] < 0.20:
            resp = PredictionResponse(
                status="unmatched",
                query_original=raw_text,
                query_normalized=normalized_text,
                extracted_entities=extracted_model,
                primary_match=None,
                alternatives=[],
                clarification=None,
                overall_confidence=0.0,
                confidence_level="none",
                warnings=["Insufficient evidence to identify verified Indian PIN code. Please specify city, district, or landmark."],
                model_version=candidate_ranker.model_version_tag,
                dataset_version="IndiaPost-2024.1",
                ranking_mode="deterministic_fallback" if candidate_ranker.ml_model is None else "ml_ranker",
                latency_ms=latency_ms
            )
            self._save_history(db, req.session_id, raw_text, "unmatched", None, None, 0.0)
            return resp

        # Build CandidateMatch models
        formatted_candidates: List[CandidateMatch] = []
        for c in calibrated_candidates[:6]:
            rec = c["record"]
            evidence_items = explainer.explain_candidate(c, entities, corrections)
            formatted_candidates.append(CandidateMatch(
                id=rec.id,
                pin_code=rec.pin_code,
                post_office_name=rec.post_office_name,
                office_type=rec.office_type,
                delivery_status=rec.delivery_status,
                locality=rec.locality,
                district=rec.district,
                state=rec.state,
                division=rec.division,
                circle=rec.circle,
                latitude=rec.latitude,
                longitude=rec.longitude,
                has_verified_coords=rec.has_verified_coords,
                raw_match_score=round(c["raw_match_score"] * 100, 1),
                calibrated_confidence=round(c["calibrated_confidence"] * 100, 1),
                confidence_level=c["confidence_level"],
                evidence=evidence_items,
                dataset_version=rec.dataset_version or "IndiaPost-2024.1"
            ))

        primary_match = formatted_candidates[0]
        
        # Filter alternatives: only include relevant candidates from same district/city with plausible confidence
        relevant_alternatives: List[CandidateMatch] = []
        for alt_cand, c_data in zip(formatted_candidates[1:4], calibrated_candidates[1:4]):
            feats = c_data["features"]
            # Exclude candidates with contradictory state or district
            if feats.get("state_agreement", 0) < 0 or feats.get("district_agreement", 0) < 0:
                continue
            # Must have plausible score
            if alt_cand.calibrated_confidence >= 15.0 or alt_cand.raw_match_score >= 25.0:
                relevant_alternatives.append(alt_cand)

        overall_conf = primary_match.calibrated_confidence / 100.0

        # Check if ambiguous
        is_ambiguous = False
        clarification_q = None

        if primary_match.confidence_level in ("medium", "low") or (
            len(relevant_alternatives) > 0 and 
            abs(primary_match.calibrated_confidence - relevant_alternatives[0].calibrated_confidence) < 15.0 and
            primary_match.calibrated_confidence < 85.0
        ):
            is_ambiguous = True
            clarification_q = explainer.generate_clarification_question(calibrated_candidates, entities)

        status = "ambiguous" if is_ambiguous else "matched"

        resp = PredictionResponse(
            status=status,
            query_original=raw_text,
            query_normalized=normalized_text,
            extracted_entities=extracted_model,
            primary_match=primary_match,
            alternatives=relevant_alternatives if (is_ambiguous or len(relevant_alternatives) > 0) else [],
            clarification=clarification_q,
            overall_confidence=round(overall_conf, 4),
            confidence_level=primary_match.confidence_level,
            warnings=[],
            model_version=candidate_ranker.model_version_tag,
            dataset_version="IndiaPost-2024.1",
            ranking_mode=calibrated_candidates[0].get("ranking_mode", "deterministic_fallback"),
            latency_ms=latency_ms
        )

        self._save_history(
            db, req.session_id, raw_text, status,
            primary_match.pin_code, primary_match.post_office_name,
            overall_conf, evidence=primary_match.evidence
        )

        return resp

    def _save_history(
        self,
        db: Session,
        session_id: Optional[str],
        query: str,
        status: str,
        pin: Optional[str],
        po_name: Optional[str],
        confidence: float,
        evidence: Optional[List[EvidenceItem]] = None
    ):
        if not session_id:
            session_id = "anon-session-default"

        evidence_json = json.dumps([e.model_dump() for e in (evidence or [])]) if evidence else None
        record = SearchHistory(
            session_id=session_id,
            query_text=query,
            query_type="address_prediction",
            predicted_pin=pin,
            predicted_post_office=po_name,
            confidence=confidence,
            status=status,
            match_evidence=evidence_json
        )
        try:
            db.add(record)
            db.commit()
        except Exception:
            db.rollback()

prediction_service = PredictionService()
