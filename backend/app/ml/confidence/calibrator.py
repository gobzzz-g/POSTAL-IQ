from typing import List, Dict, Any, Tuple
from backend.app.core.config import settings

def calibrate_candidate_confidence(
    ranked_candidates: List[Dict[str, Any]],
    entities: Dict[str, Any]
) -> List[Dict[str, Any]]:
    if not ranked_candidates:
        return []

    calibrated_list = []
    top_score = ranked_candidates[0]["raw_match_score"]
    second_score = ranked_candidates[1]["raw_match_score"] if len(ranked_candidates) > 1 else 0.0

    # Margin between top and runner-up candidate
    margin = max(0.0, top_score - second_score)

    for idx, cand in enumerate(ranked_candidates):
        feats = cand["features"]
        raw = cand["raw_match_score"]

        # Base confidence begins from raw match score
        confidence = raw

        # Positive multipliers for verified structural evidence
        if feats.get("pin_agreement", 0) > 0:
            confidence = min(0.99, confidence * 1.25)
        if feats.get("locality_score", 0) >= 0.9 and feats.get("district_agreement", 0) >= 0:
            # Strong locality match
            confidence = min(0.99, max(confidence, 0.88 + (feats.get("locality_score", 0) * 0.10)))
        if feats.get("district_agreement", 0) > 0 and feats.get("state_agreement", 0) > 0:
            confidence = min(0.99, confidence * 1.10)

        # Severe penalties for contradictions
        if feats.get("state_agreement", 0) < 0:
            confidence *= 0.01
        if feats.get("district_agreement", 0) < 0:
            confidence *= 0.05
        if feats.get("pin_agreement", 0) < 0:
            confidence *= 0.05

        # Absence of locality or district evidence
        if feats.get("locality_score", 0) < 0.2 and feats.get("district_agreement", 0) <= 0:
            confidence *= 0.10

        # Ambiguity reduction for leading candidate when runner-up is neck-and-neck
        if idx == 0 and len(ranked_candidates) > 1 and margin < 0.08 and raw < 0.85:
            confidence = confidence * 0.75

        confidence = round(min(0.99, max(0.0, confidence)), 4)

        # Categorize confidence level
        if confidence >= settings.CONFIDENCE_HIGH_THRESHOLD:
            level = "high"
        elif confidence >= settings.CONFIDENCE_MEDIUM_THRESHOLD:
            level = "medium"
        elif confidence >= settings.CONFIDENCE_MIN_THRESHOLD:
            level = "low"
        else:
            level = "none"

        cand_copy = cand.copy()
        cand_copy["calibrated_confidence"] = confidence
        cand_copy["confidence_level"] = level
        calibrated_list.append(cand_copy)

    return calibrated_list
