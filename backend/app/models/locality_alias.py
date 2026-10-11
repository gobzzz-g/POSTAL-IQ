from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from datetime import datetime, timezone
from backend.app.database.session import Base

class LocalityAlias(Base):
    __tablename__ = "locality_aliases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alias_name = Column(String(150), nullable=False, index=True)
    standard_name = Column(String(150), nullable=False)
    pin_code = Column(String(6), nullable=False, index=True)
    post_office_id = Column(Integer, ForeignKey("post_offices.id", ondelete="SET NULL"), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_alias_pin", "alias_name", "pin_code"),
    )
