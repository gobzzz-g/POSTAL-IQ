from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from backend.app.database.session import get_db
from backend.app.schemas.postal import PostOfficeListResponse
from backend.app.services.postal_service import postal_service

router = APIRouter()

@router.get("/search", response_model=PostOfficeListResponse)
def search_postal_records(
    q: Optional[str] = Query(None, description="Search term for PIN, office name, or locality"),
    state: Optional[str] = Query(None, description="State filter"),
    district: Optional[str] = Query(None, description="District filter"),
    delivery_status: Optional[str] = Query(None, description="Delivery or Non-Delivery"),
    has_verified_coords: Optional[bool] = Query(None, description="Filter only records with verified GPS coordinates"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return postal_service.search(
        db=db,
        query=q,
        state=state,
        district=district,
        delivery_status=delivery_status,
        has_verified_coords=has_verified_coords,
        page=page,
        size=size
    )

@router.get("/autocomplete")
def autocomplete_postal_query(
    q: str = Query(..., min_length=2),
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db)
):
    return postal_service.autocomplete(db, q, limit=limit)
