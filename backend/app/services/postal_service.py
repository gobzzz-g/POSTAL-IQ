import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models.post_office import PostOffice
from backend.app.models.locality_alias import LocalityAlias
from backend.app.schemas.postal import (
    PostOfficeResponse, PostOfficeListResponse, PostOfficeCreate, PostOfficeUpdate
)

class PostalService:
    def get_by_pin(self, db: Session, pin: str) -> List[PostOfficeResponse]:
        records = db.query(PostOffice).filter(PostOffice.pin_code == pin).all()
        return [PostOfficeResponse.from_orm(r) for r in records]

    def get_by_id(self, db: Session, po_id: int) -> Optional[PostOfficeResponse]:
        rec = db.query(PostOffice).filter(PostOffice.id == po_id).first()
        return PostOfficeResponse.from_orm(rec) if rec else None

    def search(
        self,
        db: Session,
        query: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        delivery_status: Optional[str] = None,
        page: int = 1,
        size: int = 20
    ) -> PostOfficeListResponse:
        q = db.query(PostOffice)

        if query:
            term = f"%{query.strip()}%"
            q = q.filter(
                or_(
                    PostOffice.pin_code.ilike(term),
                    PostOffice.post_office_name.ilike(term),
                    PostOffice.locality.ilike(term),
                    PostOffice.district.ilike(term)
                )
            )

        if state:
            q = q.filter(PostOffice.state.ilike(f"%{state.strip()}%"))

        if district:
            q = q.filter(PostOffice.district.ilike(f"%{district.strip()}%"))

        if delivery_status:
            q = q.filter(PostOffice.delivery_status == delivery_status)

        total = q.count()
        total_pages = math.ceil(total / size) if size > 0 else 1
        offset = (page - 1) * size

        items = q.order_by(PostOffice.state, PostOffice.district, PostOffice.post_office_name).offset(offset).limit(size).all()

        return PostOfficeListResponse(
            items=[PostOfficeResponse.from_orm(r) for r in items],
            total=total,
            page=page,
            size=size,
            total_pages=total_pages
        )

    def autocomplete(self, db: Session, query: str, limit: int = 8) -> List[Dict[str, Any]]:
        if not query or len(query.strip()) < 2:
            return []
        term = f"%{query.strip()}%"
        records = db.query(PostOffice).filter(
            or_(
                PostOffice.locality.ilike(term),
                PostOffice.post_office_name.ilike(term),
                PostOffice.pin_code.ilike(term)
            )
        ).limit(limit).all()

        results = []
        for r in records:
            results.append({
                "id": r.id,
                "label": f"{r.post_office_name} ({r.pin_code})",
                "locality": r.locality,
                "pin_code": r.pin_code,
                "district": r.district,
                "state": r.state
            })
        return results

    def create_post_office(self, db: Session, data: PostOfficeCreate) -> PostOfficeResponse:
        record = PostOffice(
            pin_code=data.pin_code,
            post_office_name=data.post_office_name,
            office_type=data.office_type,
            delivery_status=data.delivery_status,
            locality=data.locality,
            district=data.district,
            state=data.state,
            division=data.division,
            region=data.region,
            circle=data.circle,
            latitude=data.latitude,
            longitude=data.longitude,
            has_verified_coords=data.has_verified_coords,
            dataset_version=data.dataset_version or "IndiaPost-Admin-Correction"
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return PostOfficeResponse.from_orm(record)

    def update_post_office(self, db: Session, po_id: int, data: PostOfficeUpdate) -> Optional[PostOfficeResponse]:
        record = db.query(PostOffice).filter(PostOffice.id == po_id).first()
        if not record:
            return None

        update_data = data.dict(exclude_unset=True)
        for key, val in update_data.items():
            setattr(record, key, val)

        db.commit()
        db.refresh(record)
        return PostOfficeResponse.from_orm(record)

    def delete_post_office(self, db: Session, po_id: int) -> bool:
        record = db.query(PostOffice).filter(PostOffice.id == po_id).first()
        if not record:
            return False
        db.delete(record)
        db.commit()
        return True

postal_service = PostalService()
