from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PostOfficeBase(BaseModel):
    pin_code: str = Field(..., min_length=6, max_length=6, pattern=r"^[1-9][0-9]{5}$")
    post_office_name: str
    office_type: str = "Sub Post Office"
    delivery_status: str = "Delivery"
    locality: str
    district: str
    state: str
    division: Optional[str] = None
    region: Optional[str] = None
    circle: Optional[str] = None
    taluk: Optional[str] = None
    telephone: Optional[str] = None
    related_suboffice: Optional[str] = None
    related_headoffice: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    has_verified_coords: bool = False
    dataset_version: Optional[str] = "IndiaPost-2024.1"

class PostOfficeCreate(PostOfficeBase):
    pass

class PostOfficeUpdate(BaseModel):
    pin_code: Optional[str] = Field(None, min_length=6, max_length=6, pattern=r"^[1-9][0-9]{5}$")
    post_office_name: Optional[str] = None
    office_type: Optional[str] = None
    delivery_status: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    division: Optional[str] = None
    region: Optional[str] = None
    circle: Optional[str] = None
    taluk: Optional[str] = None
    telephone: Optional[str] = None
    related_suboffice: Optional[str] = None
    related_headoffice: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    has_verified_coords: Optional[bool] = None

class PostOfficeResponse(PostOfficeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class PostOfficeListResponse(BaseModel):
    items: List[PostOfficeResponse]
    total: int
    page: int
    size: int
    total_pages: int

class LocalityAliasResponse(BaseModel):
    id: int
    alias_name: str
    standard_name: str
    pin_code: str
    district: Optional[str] = None
    state: Optional[str] = None

    class Config:
        from_attributes = True
