from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class BatchRecordResult(BaseModel):
    row_index: int
    original_address: str
    normalized_address: str
    predicted_pin: Optional[str] = None
    post_office_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    confidence: float = 0.0
    confidence_level: str = "none"
    status: str  # matched, ambiguous, unmatched, conflict, invalid_input, error
    suggested_alternative: Optional[str] = None
    review_required: bool = False
    notes: Optional[str] = None

class BatchJobStatus(BaseModel):
    job_id: str
    filename: str
    total_records: int
    processed_records: int
    matched_count: int
    ambiguous_count: int
    unmatched_count: int
    conflict_count: int = 0
    invalid_count: int = 0
    status: str  # processing, completed, failed
    created_at: datetime
    completed_at: Optional[datetime] = None
    results: List[BatchRecordResult] = []
