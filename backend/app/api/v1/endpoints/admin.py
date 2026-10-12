from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.database.session import get_db, engine, Base
from backend.app.core.security import verify_password, hash_password, create_access_token
from backend.app.security.auth import get_current_admin
from backend.app.models.admin_user import AdminUser
from backend.app.models.user_login import UserLoginHistory
from backend.app.schemas.admin import (
    LoginRequest, ChangeCredentialsRequest, ChangeCredentialsResponse,
    TokenResponse, AdminUserResponse, AnalyticsResponse
)
from backend.app.schemas.postal import (
    PostOfficeResponse, PostOfficeListResponse, PostOfficeCreate, PostOfficeUpdate
)
from backend.app.services.admin_service import admin_service
from backend.app.services.postal_service import postal_service

router = APIRouter()

@router.post("/admin/login", response_model=TokenResponse)
def admin_login(creds: LoginRequest, request: Request, db: Session = Depends(get_db)):
    Base.metadata.create_all(bind=engine)
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

    # Record successful admin login in audit history
    try:
        ip = request.client.host if request.client else "127.0.0.1"
        ua = request.headers.get("user-agent", "Unknown")[:250]
        login_entry = UserLoginHistory(
            username_or_email=user.username,
            role=user.role,
            ip_address=ip,
            user_agent=ua,
            status="success"
        )
        db.add(login_entry)
        db.commit()
    except Exception:
        db.rollback()

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

@router.post("/admin/change-credentials", response_model=ChangeCredentialsResponse)
def admin_change_credentials(
    payload: ChangeCredentialsRequest,
    db: Session = Depends(get_db)
):
    Base.metadata.create_all(bind=engine)
    target_username = (payload.current_username or "admin").strip()
    user = db.query(AdminUser).filter(AdminUser.username == target_username).first()
    if not user:
        # Fallback to the first admin user in database if exact match wasn't found
        user = db.query(AdminUser).first()

    if not user or not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current administrator password verification failed. Please verify your existing password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive."
        )

    # Check new username if requested
    if payload.new_username and payload.new_username.strip():
        new_user = payload.new_username.strip()
        if new_user != user.username:
            existing = db.query(AdminUser).filter(AdminUser.username == new_user).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Username '{new_user}' is already registered to another administrator."
                )
            user.username = new_user

    # Check new password if requested
    if payload.new_password and payload.new_password.strip():
        new_pwd = payload.new_password.strip()
        if len(new_pwd) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters in length."
            )
        user.hashed_password = hash_password(new_pwd)

    db.commit()
    db.refresh(user)

    return ChangeCredentialsResponse(
        message="Administrator credentials updated successfully.",
        username=user.username
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

@router.post("/admin/post-offices/bulk-upload")
async def admin_bulk_upload_post_offices(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid .csv file."
        )
    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowable limit of 25MB."
        )
    result = postal_service.import_csv(db, content)
    return result

@router.post("/auth/record-login")
def record_user_login(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db)
):
    Base.metadata.create_all(bind=engine)
    username = payload.get("username_or_email") or payload.get("email") or "guest"
    role = payload.get("role", "user")
    ip = request.client.host if request.client else "127.0.0.1"
    ua = request.headers.get("user-agent", "Unknown")[:250]
    entry = UserLoginHistory(
        username_or_email=username,
        role=role,
        ip_address=ip,
        user_agent=ua,
        status="success"
    )
    db.add(entry)
    db.commit()
    return {"message": "User login recorded successfully."}

@router.get("/admin/login-history")
def get_user_login_history(
    page: int = Query(1, ge=1),
    size: int = Query(15, ge=1, le=100),
    query: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    import math
    Base.metadata.create_all(bind=engine)

    # Purge any previously seeded demo mock data or testclient data
    demo_mock_emails = [
        "analyst@postaliq.gov.in",
        "auditor.dept@indiapost.gov.in",
        "ops-center@postaliq.gov.in",
    ]
    db.query(UserLoginHistory).filter(
        (UserLoginHistory.username_or_email.in_(demo_mock_emails)) |
        (UserLoginHistory.user_agent == "testclient") |
        (UserLoginHistory.ip_address == "testclient")
    ).delete(synchronize_session=False)
    db.commit()

    q = db.query(UserLoginHistory)
    if query and query.strip():
        term = f"%{query.strip().lower()}%"
        q = q.filter(
            (UserLoginHistory.username_or_email.ilike(term)) |
            (UserLoginHistory.role.ilike(term)) |
            (UserLoginHistory.ip_address.ilike(term))
        )

    total = q.count()
    total_pages = max(1, math.ceil(total / size))
    offset = (page - 1) * size
    items = q.order_by(UserLoginHistory.created_at.desc()).offset(offset).limit(size).all()

    from sqlalchemy import func
    unique_count = db.query(func.count(func.distinct(UserLoginHistory.username_or_email))).scalar() or 0
    admin_count = db.query(func.count(UserLoginHistory.id)).filter(UserLoginHistory.role.in_(["superadmin", "admin", "administrator"])).scalar() or 0

    return {
        "items": [
            {
                "id": it.id,
                "username_or_email": it.username_or_email,
                "role": it.role,
                "ip_address": it.ip_address or "127.0.0.1",
                "user_agent": it.user_agent or "Web Client",
                "status": it.status,
                "created_at": it.created_at.isoformat() if it.created_at else None
            }
            for it in items
        ],
        "total": total,
        "page": page,
        "size": size,
        "total_pages": total_pages,
        "stats": {
            "total_logins": total,
            "unique_users": unique_count,
            "admin_logins": admin_count,
        }
    }

@router.delete("/admin/login-history")
def clear_user_login_history(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin)
):
    count = db.query(UserLoginHistory).delete()
    db.commit()
    return {"message": f"Successfully cleared {count} login history records."}

