from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PredictionRequest(BaseModel):
    address_text: str = Field(..., max_length=1000)
    explicit_pin: Optional[str] = Field(None, min_length=6, max_length=6, pattern=r"^[1-9][0-9]{5}$")
    session_id: Optional[str] = None
    clarification_answer: Optional[str] = None
    clarification_attribute: Optional[str] = None  # e.g. "district", "state", "candidate_id"

class EvidenceItem(BaseModel):
    category: str  # locality, district, state, pin, abbreviation, spelling, coordinates
    description: str
    is_positive: bool = True
    confidence_weight: float = 1.0

class CandidateMatch(BaseModel):
    id: int
    pin_code: str
    post_office_name: str
    office_type: str
    delivery_status: str
    locality: str
    district: str
    state: str
    division: Optional[str] = None
    circle: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    has_verified_coords: bool = False
    
    # ML & match scoring
    raw_match_score: float = Field(..., description="Raw text & feature similarity (0-100%)")
    calibrated_confidence: float = Field(..., description="Calibrated correctness probability (0-100%)")
    confidence_level: str = "medium"  # high, medium, low
    evidence: List[EvidenceItem] = []
    dataset_version: str = "IndiaPost-2024.1"

class ClarificationOption(BaseModel):
    id: str
    label: str
    description: Optional[str] = None
    pin_code: Optional[str] = None
    candidate_id: Optional[int] = None

class ClarificationQuestion(BaseModel):
    attribute: str  # district, city, candidate
    question: str
    options: List[ClarificationOption]
    reason: str

class ExtractedEntities(BaseModel):
    locality: Optional[str] = None
    city_or_town: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    landmarks: List[str] = []
    corrections_applied: Dict[str, str] = {}

class PredictionResponse(BaseModel):
    status: str  # matched, ambiguous, unmatched
    query_original: str
    query_normalized: str
    extracted_entities: ExtractedEntities
    primary_match: Optional[CandidateMatch] = None
    alternatives: List[CandidateMatch] = []
    clarification: Optional[ClarificationQuestion] = None
    overall_confidence: float
    confidence_level: str  # high, medium, low, none
    warnings: List[str] = []
    model_version: str
    dataset_version: str
    ranking_mode: str  # ml_ranker or deterministic_fallback
    latency_ms: float
