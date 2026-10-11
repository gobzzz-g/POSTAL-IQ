import re
from typing import List, Dict, Any, Optional, Set
from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from backend.app.models.post_office import PostOffice
from backend.app.models.locality_alias import LocalityAlias
from backend.app.ml.candidate_retrieval.tfidf_matcher import tfidf_matcher
from backend.app.ml.entity_extraction.gazetteer import are_districts_compatible, are_states_compatible

POSTAL_STOPWORDS = {
    "post", "office", "head", "sub", "branch", "road", "street", "lane",
    "cross", "main", "near", "opp", "opposite", "behind", "adjacent",
    "district", "state", "india", "unknown", "locality", "nowhere",
    "imaginary", "xyzqv", "city", "town", "floor", "building", "block",
    "sector", "phase", "layout", "station", "junction", "nagar", "puram"
}

class CandidateRetriever:
    def retrieve(
        self,
        db: Session,
        normalized_query: str,
        entities: Dict[str, Any],
        top_k: int = 15
    ) -> List[Dict[str, Any]]:
        candidate_map: Dict[int, Dict[str, Any]] = {}
        
        extracted_pin = entities.get("pin_code")
        extracted_state = entities.get("state")
        extracted_district = entities.get("district")
        extracted_city = entities.get("city_or_town")
        extracted_locality = entities.get("locality")

        # Tier 1: Exact PIN Lookup
        if extracted_pin:
            pin_records = db.query(PostOffice).filter(PostOffice.pin_code == extracted_pin).all()
            for rec in pin_records:
                candidate_map[rec.id] = {
                    "record": rec,
                    "source": "exact_pin",
                    "retrieval_score": 0.95
                }

        # Tier 2: Locality / Alias exact & substring matches
        # Build search terms in strict priority order: locality first, subdivisions second, tokens third
        ordered_terms: List[str] = []
        if extracted_locality:
            ordered_terms.append(extracted_locality.lower())
            for t in extracted_locality.lower().split():
                if len(t) >= 4 and t not in POSTAL_STOPWORDS and t not in ordered_terms:
                    ordered_terms.append(t)

        # Subdivisions (e.g., sector 16, block 4, phase 2)
        subdivision_phrases = re.findall(r'\b(?:sector|phase|block|stage|pocket|ward)\s+[0-9a-zA-Z]+\b', normalized_query)
        for sp in subdivision_phrases:
            if sp.lower() not in ordered_terms:
                ordered_terms.append(sp.lower())

        if "general post office" in normalized_query or "gpo" in normalized_query:
            ordered_terms.extend(["gpo", "g.p.o"])
        if "head post office" in normalized_query or "hpo" in normalized_query:
            ordered_terms.extend(["h.o", "hpo"])
        if "sub post office" in normalized_query:
            ordered_terms.append("s.o")

        # Generic query tokens (excluding state and district names to prevent saturating candidate limits)
        geo_tokens = set()
        if extracted_state:
            geo_tokens.update(extracted_state.lower().split())
        if extracted_district:
            geo_tokens.update(extracted_district.lower().split())
        if extracted_city:
            geo_tokens.update(extracted_city.lower().split())

        for t in normalized_query.split():
            if len(t) >= 4 and t not in POSTAL_STOPWORDS and t not in geo_tokens and t not in ordered_terms:
                ordered_terms.append(t)

        for term in ordered_terms:
            alias_matches = db.query(LocalityAlias).filter(
                LocalityAlias.alias_name.ilike(f"%{term}%")
            ).all()
            for a in alias_matches:
                matching_pos = db.query(PostOffice).filter(PostOffice.pin_code == a.pin_code).all()
                for rec in matching_pos:
                    if rec.id not in candidate_map:
                        candidate_map[rec.id] = {
                            "record": rec,
                            "source": "alias_match",
                            "retrieval_score": 0.90
                        }

            # Direct PostOffice locality or post_office_name match
            po_query = db.query(PostOffice).filter(
                (PostOffice.locality.ilike(f"%{term}%")) |
                (PostOffice.post_office_name.ilike(f"%{term}%"))
            )
            if extracted_state:
                po_query = po_query.filter(PostOffice.state.ilike(f"%{extracted_state}%"))
            loc_matches = po_query.limit(20).all()
            for rec in loc_matches:
                if rec.id not in candidate_map:
                    candidate_map[rec.id] = {
                        "record": rec,
                        "source": "locality_match",
                        "retrieval_score": 0.88
                    }

        # Tier 3: TF-IDF vector retrieval
        if not tfidf_matcher.is_fitted:
            import os
            from backend.app.core.config import settings
            artifact_path = os.path.join(settings.MODEL_ARTIFACTS_DIR, "tfidf_indexer.joblib")
            tfidf_matcher.load(artifact_path)

        if tfidf_matcher.is_fitted:
            tfidf_candidates = tfidf_matcher.find_similar(normalized_query, top_k=20, min_score=0.12) or []
            doc_ids = [cid for cid, _ in tfidf_candidates]
            if doc_ids:
                tfidf_records = db.query(PostOffice).filter(PostOffice.id.in_(doc_ids)).all()
                rec_by_id = {r.id: r for r in tfidf_records}
                for cid, score in tfidf_candidates:
                    if cid in rec_by_id:
                        if cid not in candidate_map:
                            candidate_map[cid] = {
                                "record": rec_by_id[cid],
                                "source": "tfidf",
                                "retrieval_score": float(score)
                            }
                        else:
                            candidate_map[cid]["retrieval_score"] = max(
                                candidate_map[cid]["retrieval_score"],
                                float(score)
                            )

        # Tier 4: District & State constrained matches as supplemental candidates
        if extracted_district and len(candidate_map) < top_k:
            query_filter = db.query(PostOffice).filter(PostOffice.district.ilike(f"%{extracted_district}%"))
            if extracted_state:
                query_filter = query_filter.filter(PostOffice.state.ilike(f"%{extracted_state}%"))
            district_records = query_filter.limit(8).all()
            for rec in district_records:
                if rec.id not in candidate_map:
                    candidate_map[rec.id] = {
                        "record": rec,
                        "source": "district_filter",
                        "retrieval_score": 0.60
                    }

        # Tier 5: RapidFuzz fallback ONLY if meaningful query terms exist
        if len(candidate_map) < 3 and query_tokens:
            meaningful_query = " ".join(query_tokens)
            sample_records = db.query(PostOffice).limit(60).all()
            for rec in sample_records:
                if rec.id not in candidate_map:
                    po_text = f"{rec.post_office_name} {rec.locality}".lower()
                    sim = fuzz.partial_ratio(meaningful_query, po_text) / 100.0
                    if sim > 0.65:
                        candidate_map[rec.id] = {
                            "record": rec,
                            "source": "rapidfuzz",
                            "retrieval_score": float(sim) * 0.7
                        }

        # Strict Consistency Filter on Retrieved Candidates:
        # Prevent unrelated-state and unrelated-district candidates from entering candidate pool
        # when query provides explicit geographic constraints.
        filtered_candidates = []
        for item in candidate_map.values():
            rec: PostOffice = item["record"]
            
            # Explicit state constraint check
            if extracted_state:
                if not are_states_compatible(extracted_state, rec.state):
                    continue  # Drop candidate from completely different state!

            # Explicit district constraint check
            if extracted_district:
                if not are_districts_compatible(extracted_district, rec.district):
                    continue  # Drop candidate from completely different district!

            filtered_candidates.append(item)

        return filtered_candidates[:max(top_k * 4, 50)]

candidate_retriever = CandidateRetriever()
