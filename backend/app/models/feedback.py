from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime, timezone
from backend.app.database.session import Base

class FeedbackReport(Base):
    __tablename__ = "feedback_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    query_text = Column(Text, nullable=False)
    predicted_pin = Column(String(6), nullable=True)
    predicted_post_office = Column(String(150), nullable=True)
    suggested_pin = Column(String(6), nullable=True)
    suggested_post_office = Column(String(150), nullable=True)
    user_comment = Column(Text, nullable=True)
    status = Column(String(30), default="pending")  # pending, reviewed, resolved, rejected
    reviewed_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
