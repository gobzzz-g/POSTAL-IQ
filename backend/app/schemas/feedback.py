from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class FeedbackCreate(BaseModel):
    query_text: str
    predicted_pin: Optional[str] = None
    predicted_post_office: Optional[str] = None
    suggested_pin: Optional[str] = None
    suggested_post_office: Optional[str] = None
    user_comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    query_text: str
    predicted_pin: Optional[str] = None
    predicted_post_office: Optional[str] = None
    suggested_pin: Optional[str] = None
    suggested_post_office: Optional[str] = None
    user_comment: Optional[str] = None
    status: str
    reviewed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FeedbackStatusUpdate(BaseModel):
    status: str  # reviewed, resolved, rejected
