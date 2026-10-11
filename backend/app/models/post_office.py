from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Index
from datetime import datetime, timezone
from backend.app.database.session import Base

class PostOffice(Base):
    __tablename__ = "post_offices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pin_code = Column(String(6), nullable=False, index=True)
    post_office_name = Column(String(150), nullable=False, index=True)
    office_type = Column(String(30), nullable=False, default="Sub Post Office")  # Head Post Office, Sub Post Office, Branch Post Office
    delivery_status = Column(String(30), nullable=False, default="Delivery")  # Delivery, Non-Delivery
    locality = Column(String(150), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    division = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    circle = Column(String(100), nullable=True)
    
    # Coordinates (strictly verified only)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    has_verified_coords = Column(Boolean, default=False)
    
    # Combined search helper
    search_text = Column(Text, nullable=True)
    dataset_version = Column(String(50), default="IndiaPost-2024.1")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_pin_locality", "pin_code", "locality"),
        Index("idx_district_state", "district", "state"),
        Index("idx_post_office_district", "post_office_name", "district"),
    )
