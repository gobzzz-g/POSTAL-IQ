from typing import Dict, Any, List
from rapidfuzz import fuzz
from backend.app.models.post_office import PostOffice

ADMINISTRATIVE_STOPWORDS = {
    "post", "office", "head", "sub", "branch", "road", "street", "lane",
    "district", "state", "near", "opposite", "behind", "adjacent", "floor",
    "building", "nagar", "puram", "layout", "block", "sector", "phase"
}

def extract_candidate_features(
    normalized_query: str,
    entities: Dict[str, Any],
    candidate_record: PostOffice
) -> Dict[str, float]:
    q_lower = normalized_query.lower()
    q_no_spaces = q_lower.replace(" ", "")
    
    # 1. Textual similarities
    target_composite = f"{candidate_record.post_office_name} {candidate_record.locality} {candidate_record.district} {candidate_record.state}".lower()
    token_set = fuzz.token_set_ratio(q_lower, target_composite) / 100.0
    partial_ratio = fuzz.partial_ratio(q_lower, target_composite) / 100.0
    text_sim = (token_set * 0.6) + (partial_ratio * 0.4)

    # 2. Locality agreement (checking locality and post office core name)
    cand_loc = (candidate_record.locality or "").lower()
    cand_loc_no_spaces = cand_loc.replace(" ", "")
    po_name_clean = (candidate_record.post_office_name or "").lower()
    for suffix in ["head post office", "sub post office", "branch post office", "general post office", "post office"]:
        po_name_clean = po_name_clean.replace(suffix, "").strip()
    po_name_no_spaces = po_name_clean.replace(" ", "")

    loc_score = 0.0
    # Check exact substring match (with or without spaces)
    if (cand_loc and cand_loc in q_lower) or (po_name_clean and po_name_clean in q_lower):
        loc_score = 1.0
    elif (cand_loc_no_spaces and len(cand_loc_no_spaces) >= 4 and cand_loc_no_spaces in q_no_spaces) or \
         (po_name_no_spaces and len(po_name_no_spaces) >= 4 and po_name_no_spaces in q_no_spaces):
        loc_score = 1.0
    else:
        # Token-level fuzzy match excluding administrative stopwords
        loc_tokens = [w for w in f"{cand_loc} {po_name_clean}".replace(',', ' ').split() if len(w) >= 4 and w not in ADMINISTRATIVE_STOPWORDS]
        q_tokens = [w for w in q_lower.split() if len(w) >= 4 and w not in ADMINISTRATIVE_STOPWORDS]
        for lt in loc_tokens:
            for qt in q_tokens:
                ratio = fuzz.ratio(lt, qt)
                if ratio >= 82:
                    score = 0.95 if ratio >= 88 else 0.75
                    if score > loc_score:
                        loc_score = score

    # 3. District agreement & contradiction safeguard
    extracted_dist = entities.get("district")
    extracted_city = entities.get("city_or_town")
    cand_dist = (candidate_record.district or "").lower()
    
    if extracted_dist:
        extracted_dist_lower = extracted_dist.lower()
        if extracted_dist_lower == cand_dist or extracted_dist_lower in cand_dist or cand_dist in extracted_dist_lower:
            dist_agreement = 1.0
        else:
            # Conflicting district explicitly extracted from query!
            dist_agreement = -1.0
    elif extracted_city:
        extracted_city_lower = extracted_city.lower()
        if extracted_city_lower in cand_dist or cand_dist in extracted_city_lower:
            dist_agreement = 1.0
        else:
            dist_agreement = -0.5
    else:
        dist_agreement = 0.0

    # 4. State agreement & contradiction safeguard
    extracted_state = entities.get("state")
    cand_state = (candidate_record.state or "").lower()
    if extracted_state:
        extracted_state_lower = extracted_state.lower()
        if extracted_state_lower == cand_state or extracted_state_lower in cand_state:
            state_agreement = 1.0
        else:
            # Conflicting state explicitly extracted from query!
            state_agreement = -1.0
    else:
        state_agreement = 0.0

    # 5. PIN agreement & contradiction safeguard
    extracted_pin = entities.get("pin_code")
    if extracted_pin:
        if extracted_pin == candidate_record.pin_code:
            pin_agreement = 1.0
        else:
            pin_agreement = -1.0
    else:
        pin_agreement = 0.0

    # 6. Postal office hierarchy & delivery weights
    office_type = (candidate_record.office_type or "").lower()
    if "head" in office_type:
        office_weight = 1.0
    elif "sub" in office_type:
        office_weight = 0.85
    else:
        office_weight = 0.60

    delivery_status = (candidate_record.delivery_status or "").lower()
    delivery_weight = 1.0 if "delivery" in delivery_status and "non" not in delivery_status else 0.5

    return {
        "text_similarity": text_sim,
        "locality_score": loc_score,
        "district_agreement": dist_agreement,
        "state_agreement": state_agreement,
        "pin_agreement": pin_agreement,
        "office_weight": office_weight,
        "delivery_weight": delivery_weight
    }
