from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Index
from datetime import datetime, timezone
from backend.app.database.session import Base

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), nullable=False, index=True)  # Anonymous session uuid isolation
    query_text = Column(Text, nullable=False)
    query_type = Column(String(30), default="address_prediction")  # address_prediction, pin_lookup, post_office_search
    predicted_pin = Column(String(6), nullable=True)
    predicted_post_office = Column(String(150), nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String(30), default="matched")  # matched, ambiguous, unmatched, error
    match_evidence = Column(Text, nullable=True)  # JSON serialized evidence
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        Index("idx_session_created", "session_id", "created_at"),
    )
