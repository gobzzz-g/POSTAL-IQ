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
        return [PostOfficeResponse.model_validate(r) for r in records]

    def get_by_id(self, db: Session, po_id: int) -> Optional[PostOfficeResponse]:
        rec = db.query(PostOffice).filter(PostOffice.id == po_id).first()
        return PostOfficeResponse.model_validate(rec) if rec else None

    def search(
        self,
        db: Session,
        query: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        delivery_status: Optional[str] = None,
        has_verified_coords: Optional[bool] = None,
        page: int = 1,
        size: int = 20
    ) -> PostOfficeListResponse:
        q = db.query(PostOffice)

        if has_verified_coords is not None:
            q = q.filter(PostOffice.has_verified_coords == has_verified_coords)

        if query:
            clean_q = query.strip()
            if clean_q.isdigit() and len(clean_q) == 6:
                # Fast B-Tree indexed exact PIN search
                q = q.filter(PostOffice.pin_code == clean_q)
            elif clean_q.isdigit():
                # Numeric prefix search
                q = q.filter(PostOffice.pin_code.like(f"{clean_q}%"))
            else:
                term = f"%{clean_q}%"
                q = q.filter(
                    or_(
                        PostOffice.pin_code.like(f"{clean_q}%"),
                        PostOffice.post_office_name.ilike(term),
                        PostOffice.locality.ilike(term),
                        PostOffice.taluk.ilike(term),
                        PostOffice.district.ilike(term),
                        PostOffice.state.ilike(term)
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
            items=[PostOfficeResponse.model_validate(r) for r in items],
            total=total,
            page=page,
            size=size,
            total_pages=total_pages
        )

    def autocomplete(self, db: Session, query: str, limit: int = 8) -> List[Dict[str, Any]]:
        if not query or len(query.strip()) < 2:
            return []
        clean_q = query.strip()
        if clean_q.isdigit() and len(clean_q) <= 6:
            records = db.query(PostOffice).filter(PostOffice.pin_code.like(f"{clean_q}%")).limit(limit).all()
        else:
            term = f"%{clean_q}%"
            records = db.query(PostOffice).filter(
                or_(
                    PostOffice.post_office_name.ilike(term),
                    PostOffice.locality.ilike(term),
                    PostOffice.taluk.ilike(term),
                    PostOffice.pin_code.like(f"{clean_q}%")
                )
            ).limit(limit).all()

        results = []
        for r in records:
            results.append({
                "id": r.id,
                "label": f"{r.post_office_name} ({r.pin_code}) - {r.district}, {r.state}",
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
            taluk=data.taluk,
            district=data.district,
            state=data.state,
            division=data.division,
            region=data.region,
            circle=data.circle,
            telephone=data.telephone,
            related_suboffice=data.related_suboffice,
            related_headoffice=data.related_headoffice,
            latitude=data.latitude,
            longitude=data.longitude,
            has_verified_coords=data.has_verified_coords,
            dataset_version=data.dataset_version or "IndiaPost-Admin-Correction"
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return PostOfficeResponse.model_validate(record)

    def update_post_office(self, db: Session, po_id: int, data: PostOfficeUpdate) -> Optional[PostOfficeResponse]:
        record = db.query(PostOffice).filter(PostOffice.id == po_id).first()
        if not record:
            return None

        update_data = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else data.dict(exclude_unset=True)
        for key, val in update_data.items():
            setattr(record, key, val)

        db.commit()
        db.refresh(record)
        return PostOfficeResponse.model_validate(record)

    def delete_post_office(self, db: Session, po_id: int) -> bool:
        record = db.query(PostOffice).filter(PostOffice.id == po_id).first()
        if not record:
            return False
        db.delete(record)
        db.commit()
        return True

    def get_network_dots(self, db: Session) -> List[Dict[str, Any]]:
        from sqlalchemy import func
        results = db.query(
            PostOffice.district,
            PostOffice.state,
            func.round(func.avg(PostOffice.latitude), 4).label("latitude"),
            func.round(func.avg(PostOffice.longitude), 4).label("longitude"),
            func.count(PostOffice.id).label("count")
        ).filter(
            PostOffice.latitude.isnot(None),
            PostOffice.longitude.isnot(None)
        ).group_by(
            PostOffice.district,
            PostOffice.state
        ).order_by(
            func.count(PostOffice.id).desc()
        ).all()

        return [
            {
                "district": r.district,
                "state": r.state,
                "latitude": float(r.latitude) if r.latitude else 20.5937,
                "longitude": float(r.longitude) if r.longitude else 78.9629,
                "count": r.count
            }
            for r in results
        ]

postal_service = PostalService()
