import re
from typing import Dict, Any, List, Optional
from backend.app.ml.entity_extraction.gazetteer import (
    INDIAN_STATES, CITY_TO_DISTRICT, STANDARD_DISTRICTS,
    KNOWN_LOCALITY_ANCHORS, LANDMARK_INDICATORS
)

# 6-digit PIN code regex for India (starts with 1-9, never 0)
PIN_REGEX = re.compile(r'\b([1-9][0-9]{5})\b')

class EntityExtractor:
    def __init__(self, known_districts: Optional[List[str]] = None, known_localities: Optional[List[str]] = None):
        self.known_districts: Dict[str, str] = {}
        # Prepopulate with standard gazetteer districts
        for d_key, (d_name, _) in STANDARD_DISTRICTS.items():
            self.known_districts[d_key] = d_name

        for d in (known_districts or []):
            if d:
                self.known_districts[d.lower()] = d

        self.known_localities: Dict[str, str] = {}
        for l_key in KNOWN_LOCALITY_ANCHORS.keys():
            self.known_localities[l_key] = l_key.title()
        for loc in (known_localities or []):
            if loc:
                self.known_localities[loc.lower()] = loc

    def update_gazetteer(self, districts: List[str], localities: List[str]):
        for d in districts:
            if d:
                self.known_districts[d.lower()] = d
        for loc in localities:
            if loc:
                self.known_localities[loc.lower()] = loc

    def extract(self, normalized_text: str) -> Dict[str, Any]:
        result = {
            "pin_code": None,
            "state": None,
            "district": None,
            "city_or_town": None,
            "locality": None,
            "landmarks": [],
            "has_geographic_conflict": False,
            "conflict_details": None
        }

        if not normalized_text:
            return result

        # 1. Extract PIN code
        pin_match = PIN_REGEX.search(normalized_text)
        if pin_match:
            result["pin_code"] = pin_match.group(1)

        # 2. Extract State (check multi-word states first)
        sorted_states = sorted(INDIAN_STATES.keys(), key=lambda s: len(s), reverse=True)
        for state_key in sorted_states:
            pattern = rf'\b{re.escape(state_key)}\b'
            if re.search(pattern, normalized_text):
                result["state"] = INDIAN_STATES[state_key]
                break

        # 3. Extract District from known districts (longest first, e.g. "Central Delhi" before "Delhi")
        sorted_districts = sorted(self.known_districts.keys(), key=lambda d: len(d), reverse=True)
        for dist_key in sorted_districts:
            pattern = rf'\b{re.escape(dist_key)}\b'
            if re.search(pattern, normalized_text):
                result["district"] = self.known_districts[dist_key]
                # If state not already found and district has standard state, associate it
                if not result["state"] and dist_key in STANDARD_DISTRICTS:
                    result["state"] = STANDARD_DISTRICTS[dist_key][1]
                break

        # 4. Extract City & map to District if district not already extracted
        sorted_cities = sorted(CITY_TO_DISTRICT.keys(), key=lambda c: len(c), reverse=True)
        for city_key in sorted_cities:
            pattern = rf'\b{re.escape(city_key)}\b'
            if re.search(pattern, normalized_text):
                result["city_or_town"] = city_key.title()
                if not result["district"]:
                    result["district"] = CITY_TO_DISTRICT[city_key]
                break

        # 5. Extract Locality from known localities
        sorted_locs = sorted(self.known_localities.keys(), key=lambda l: len(l), reverse=True)
        for loc_key in sorted_locs:
            pattern = rf'\b{re.escape(loc_key)}\b'
            # Also check without spaces (e.g. daryaganj vs darya ganj)
            norm_no_spaces = normalized_text.replace(" ", "")
            key_no_spaces = loc_key.replace(" ", "")
            if re.search(pattern, normalized_text) or (len(key_no_spaces) >= 5 and key_no_spaces in norm_no_spaces):
                result["locality"] = self.known_localities[loc_key]
                break

        # 6. Extract Landmark clauses
        for ind in LANDMARK_INDICATORS:
            if ind in normalized_text:
                m = re.search(rf'\b{re.escape(ind)}\s+([a-zA-Z0-9\s]{{3,30}})', normalized_text)
                if m:
                    phrase = f"{ind} {m.group(1).strip()}"
                    result["landmarks"].append(phrase)

        # 7. Check for explicit geographic conflicts between known locality anchor and stated state/district
        for anchor_key, (anchor_dist, anchor_state) in KNOWN_LOCALITY_ANCHORS.items():
            pattern = rf'\b{re.escape(anchor_key)}\b'
            norm_no_spaces = normalized_text.replace(" ", "")
            key_no_spaces = anchor_key.replace(" ", "")
            if re.search(pattern, normalized_text) or (len(key_no_spaces) >= 5 and key_no_spaces in norm_no_spaces):
                # Locality detected. Does query explicitly state conflicting state or district?
                if result["state"] and result["state"].lower() != anchor_state.lower():
                    result["has_geographic_conflict"] = True
                    result["conflict_details"] = (
                        f"Locality '{anchor_key.title()}' belongs to {anchor_dist}, {anchor_state}, "
                        f"which conflicts with specified state '{result['state']}'."
                    )
                    break
                if result["district"] and result["district"].lower() != anchor_dist.lower():
                    # Check if district is from a different metro entirely
                    if not (anchor_dist.lower() in result["district"].lower() or result["district"].lower() in anchor_dist.lower()):
                        result["has_geographic_conflict"] = True
                        result["conflict_details"] = (
                            f"Locality '{anchor_key.title()}' belongs to {anchor_dist}, {anchor_state}, "
                            f"which conflicts with specified district '{result['district']}'."
                        )
                        break

        return result

extractor = EntityExtractor()
