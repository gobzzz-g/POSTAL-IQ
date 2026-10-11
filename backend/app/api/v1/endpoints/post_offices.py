from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.database.session import get_db
from backend.app.schemas.postal import PostOfficeResponse, PostOfficeListResponse
from backend.app.services.postal_service import postal_service

router = APIRouter()

@router.get("/post-offices", response_model=PostOfficeListResponse)
def list_post_offices(
    query: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    delivery_status: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return postal_service.search(
        db=db,
        query=query,
        state=state,
        district=district,
        delivery_status=delivery_status,
        page=page,
        size=size
    )

@router.get("/post-offices/{po_id}", response_model=PostOfficeResponse)
def get_post_office_by_id(po_id: int, db: Session = Depends(get_db)):
    result = postal_service.get_by_id(db, po_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post office with ID {po_id} not found."
        )
    return result
