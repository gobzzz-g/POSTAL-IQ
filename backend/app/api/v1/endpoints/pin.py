import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.schemas.postal import PostOfficeResponse
from backend.app.services.postal_service import postal_service

router = APIRouter()
PIN_PATTERN = re.compile(r'^[1-9][0-9]{5}$')

@router.get("/pin/{pin}", response_model=List[PostOfficeResponse])
def get_post_offices_by_pin(pin: str, db: Session = Depends(get_db)):
    if not PIN_PATTERN.match(pin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Indian PIN code format '{pin}'. Must be a 6-digit number starting with 1-9."
        )

    results = postal_service.get_by_pin(db, pin)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No postal records found for PIN code {pin} in official dataset."
        )

    return results
