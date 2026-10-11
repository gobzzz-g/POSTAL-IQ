from typing import List, Dict, Any, Optional
from backend.app.models.post_office import PostOffice
from backend.app.schemas.prediction import EvidenceItem, ClarificationQuestion, ClarificationOption

class PredictionExplainer:
    def explain_candidate(
        self,
        candidate_data: Dict[str, Any],
        entities: Dict[str, Any],
        corrections_applied: Dict[str, str]
    ) -> List[EvidenceItem]:
        rec: PostOffice = candidate_data["record"]
        feats = candidate_data["features"]
        evidence: List[EvidenceItem] = []

        # 1. Spelling corrections
        if corrections_applied:
            for orig, corr in corrections_applied.items():
                if corr.lower() in (rec.locality or "").lower() or corr.lower() in (rec.post_office_name or "").lower():
                    evidence.append(EvidenceItem(
                        category="spelling",
                        description=f"Spelling automatically corrected: '{orig}' → '{corr}'",
                        is_positive=True,
                        confidence_weight=1.0
                    ))

        # 2. Locality evidence
        if feats.get("locality_score", 0) >= 0.8:
            evidence.append(EvidenceItem(
                category="locality",
                description=f"Verified locality match: '{rec.locality}' identified in query",
                is_positive=True,
                confidence_weight=1.2
            ))

        # 3. District agreement or conflict
        dist_agr = feats.get("district_agreement", 0)
        if dist_agr > 0:
            evidence.append(EvidenceItem(
                category="district",
                description=f"District agreement: '{rec.district}' matches address",
                is_positive=True,
                confidence_weight=1.0
            ))
        elif dist_agr < 0:
            evidence.append(EvidenceItem(
                category="district",
                description=f"Contradictory district: Input indicated '{entities.get('district')}', but post office is in '{rec.district}'",
                is_positive=False,
                confidence_weight=0.5
            ))

        # 4. State agreement or conflict
        state_agr = feats.get("state_agreement", 0)
        if state_agr > 0:
            evidence.append(EvidenceItem(
                category="state",
                description=f"State agreement: '{rec.state}' confirmed",
                is_positive=True,
                confidence_weight=1.0
            ))
        elif state_agr < 0:
            evidence.append(EvidenceItem(
                category="state",
                description=f"Contradictory state: Input indicated '{entities.get('state')}', but post office is in '{rec.state}'",
                is_positive=False,
                confidence_weight=0.4
            ))

        # 5. PIN agreement or conflict
        pin_agr = feats.get("pin_agreement", 0)
        if pin_agr > 0:
            evidence.append(EvidenceItem(
                category="pin",
                description=f"Exact PIN match: {rec.pin_code} provided in query",
                is_positive=True,
                confidence_weight=1.5
            ))
        elif pin_agr < 0:
            evidence.append(EvidenceItem(
                category="pin",
                description=f"Conflicting PIN: Query specified {entities.get('pin_code')}, differing from {rec.pin_code}",
                is_positive=False,
                confidence_weight=0.2
            ))

        # 6. Postal Hierarchy & Delivery
        if "Head" in rec.office_type:
            evidence.append(EvidenceItem(
                category="office_type",
                description="Principal postal node: Head Post Office (HO)",
                is_positive=True,
                confidence_weight=0.9
            ))
        if rec.has_verified_coords:
            evidence.append(EvidenceItem(
                category="coordinates",
                description="Verified GPS coordinate centroid available",
                is_positive=True,
                confidence_weight=0.8
            ))

        return evidence

    def generate_clarification_question(
        self,
        top_candidates: List[Dict[str, Any]],
        entities: Dict[str, Any]
    ) -> Optional[ClarificationQuestion]:
        if len(top_candidates) < 2:
            return None

        c1: PostOffice = top_candidates[0]["record"]
        c2: PostOffice = top_candidates[1]["record"]

        # If districts differ
        if c1.district.lower() != c2.district.lower():
            options = []
            for c in top_candidates[:3]:
                rec: PostOffice = c["record"]
                options.append(ClarificationOption(
                    id=str(rec.id),
                    label=f"{rec.district}, {rec.state}",
                    description=f"{rec.post_office_name} (PIN: {rec.pin_code})",
                    pin_code=rec.pin_code,
                    candidate_id=rec.id
                ))
            return ClarificationQuestion(
                attribute="district",
                question="Multiple postal regions match your query. Which district is this address located in?",
                options=options,
                reason=f"Ambiguity detected between {c1.district} and {c2.district}."
            )

        # If post offices / localities in same district differ
        options = []
        for c in top_candidates[:3]:
            rec: PostOffice = c["record"]
            options.append(ClarificationOption(
                id=str(rec.id),
                label=f"{rec.locality} ({rec.post_office_name})",
                description=f"PIN: {rec.pin_code} - {rec.office_type}",
                pin_code=rec.pin_code,
                candidate_id=rec.id
            ))
        return ClarificationQuestion(
            attribute="candidate_id",
            question="Which specific post office or locality corresponds to your delivery point?",
            options=options,
            reason=f"Identified multiple delivery points within {c1.district}."
        )

explainer = PredictionExplainer()
