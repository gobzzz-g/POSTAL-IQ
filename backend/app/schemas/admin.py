from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class ChangeCredentialsRequest(BaseModel):
    current_username: Optional[str] = None
    current_password: str
    new_username: Optional[str] = None
    new_password: Optional[str] = None

class ChangeCredentialsResponse(BaseModel):
    message: str
    username: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "admin"

class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ModelMetric(BaseModel):
    model_name: str
    top1_accuracy: float
    top3_accuracy: float
    macro_f1: float
    mean_latency_ms: float
    test_sample_size: int
    is_active: bool

class DatasetStats(BaseModel):
    source: str = "Government of India All India Pincode Directory (OGD Platform data.gov.in)"
    import_date: Optional[datetime] = None
    last_successful_update: Optional[datetime] = None
    number_of_records_imported: int = 0
    rejected_rows: int = 0
    total_post_offices: int
    total_pin_codes: int
    total_districts: int
    total_states: int
    total_aliases: int
    dataset_version: str
    has_verified_coords_count: int

class AnalyticsResponse(BaseModel):
    total_queries: int
    matched_queries: int
    ambiguous_queries: int
    unmatched_queries: int
    match_rate_percentage: float
    avg_confidence_score: float
    confidence_distribution: Dict[str, int]  # high, medium, low, unmatched
    dataset_stats: DatasetStats
    model_evaluations: List[ModelMetric]
    recent_feedback_count: int
