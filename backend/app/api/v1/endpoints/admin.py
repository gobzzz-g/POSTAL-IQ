from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.database.session import get_db
from backend.app.core.security import verify_password, create_access_token
from backend.app.security.auth import get_current_admin
from backend.app.models.admin_user import AdminUser
from backend.app.schemas.admin import (
    LoginRequest, TokenResponse, AdminUserResponse, AnalyticsResponse
)
from backend.app.schemas.postal import (
    PostOfficeResponse, PostOfficeListResponse, PostOfficeCreate, PostOfficeUpdate
)
from backend.app.services.admin_service import admin_service
from backend.app.services.postal_service import postal_service

router = APIRouter()

@router.post("/admin/login", response_model=TokenResponse)
def admin_login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == creds.username).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive."
        )

    token = create_access_token(data={"sub": user.username, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    )

@router.get("/admin/me", response_model=AdminUserResponse)
def get_current_admin_profile(current_user: AdminUser = Depends(get_current_admin)):
    return current_user

@router.get("/admin/analytics", response_model=AnalyticsResponse)
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return admin_service.get_analytics(db)

@router.get("/admin/post-offices", response_model=PostOfficeListResponse)
def admin_list_post_offices(
    query: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    delivery_status: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
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

@router.post("/admin/post-offices", response_model=PostOfficeResponse, status_code=status.HTTP_201_CREATED)
def admin_create_post_office(
    data: PostOfficeCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    return postal_service.create_post_office(db, data)

@router.put("/admin/post-offices/{po_id}", response_model=PostOfficeResponse)
def admin_update_post_office(
    po_id: int,
    data: PostOfficeUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    updated = postal_service.update_post_office(db, po_id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post office with ID {po_id} not found."
        )
    return updated

@router.delete("/admin/post-offices/{po_id}")
def admin_delete_post_office(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    success = postal_service.delete_post_office(db, po_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post office with ID {po_id} not found."
        )
    return {"message": f"Successfully deleted post office record {po_id}."}
