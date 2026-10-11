import os
import joblib
import numpy as np
from typing import List, Dict, Any, Tuple
from backend.app.models.post_office import PostOffice
from backend.app.ml.ranking.feature_extractor import extract_candidate_features
from backend.app.core.config import settings
from backend.app.core.logging import logger

FEATURE_KEYS = [
    "text_similarity",
    "locality_score",
    "district_agreement",
    "state_agreement",
    "pin_agreement",
    "office_weight",
    "delivery_weight"
]

class CandidateRanker:
    def __init__(self):
        self.ml_model = None
        self.model_version_tag = "deterministic-v1.0"
        self._load_model_if_available()

    def _load_model_if_available(self):
        model_path = os.path.join(settings.MODEL_ARTIFACTS_DIR, "ranker_model.joblib")
        if os.path.exists(model_path):
            try:
                self.ml_model = joblib.load(model_path)
                self.model_version_tag = "ml-logistic-regression-v1.2"
                logger.info(f"Loaded trained ML ranker from {model_path}")
            except Exception as e:
                logger.warning(f"Could not load ML ranker model ({e}); using deterministic ranker.")
                self.ml_model = None
        else:
            self.model_version_tag = "deterministic-fallback-v1.0"

    def rank_candidates(
        self,
        normalized_query: str,
        entities: Dict[str, Any],
        retrieved_candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        scored_candidates = []

        for item in retrieved_candidates:
            rec: PostOffice = item["record"]
            feats = extract_candidate_features(normalized_query, entities, rec)

            # Compute match score
            if self.ml_model is not None:
                feat_vec = np.array([[feats[k] for k in FEATURE_KEYS]])
                prob = float(self.ml_model.predict_proba(feat_vec)[0][1])
                score = prob
                ranking_mode = "ml_ranker"
            else:
                score = (
                    (feats["text_similarity"] * 0.40) +
                    (feats["locality_score"] * 0.30) +
                    (max(0.0, feats["district_agreement"]) * 0.15) +
                    (max(0.0, feats["state_agreement"]) * 0.10) +
                    (max(0.0, feats["pin_agreement"]) * 0.05)
                )
                ranking_mode = "deterministic_fallback"

            # STRICT CONSISTENCY SAFEGUARDS (Applied uniformly to ML & Deterministic modes)
            # 1. State contradiction: Explicitly stated state contradicts candidate state
            if feats["state_agreement"] < 0:
                score *= 0.02  # Zero out cross-state matches when state is explicitly provided

            # 2. District contradiction: Explicitly stated district contradicts candidate district
            if feats["district_agreement"] < 0:
                score *= 0.05  # Severe penalty for contradictory district

            # 3. Explicit PIN contradiction
            if feats["pin_agreement"] < 0:
                score *= 0.10

            # 4. Absence of evidence guard: If there is NO locality match, NO district agreement, and low similarity
            if feats["locality_score"] < 0.20 and feats["district_agreement"] <= 0 and feats["text_similarity"] < 0.35:
                score = 0.0

            raw_score = min(1.0, max(0.0, score))

            scored_candidates.append({
                "record": rec,
                "features": feats,
                "raw_match_score": round(raw_score, 4),
                "ranking_mode": ranking_mode
            })

        # Sort descending by score
        scored_candidates.sort(key=lambda x: x["raw_match_score"], reverse=True)
        return scored_candidates

candidate_ranker = CandidateRanker()
