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

    def import_csv(self, db: Session, content: bytes) -> Dict[str, Any]:
        import io
        import csv

        text_stream = io.StringIO(content.decode("utf-8-sig", errors="replace"))
        reader = csv.DictReader(text_stream)
        if not reader.fieldnames:
            return {"imported_count": 0, "skipped_count": 0, "total_rows_processed": 0, "message": "CSV file contains no header row or columns."}

        # Header normalization map
        field_map = {}
        for col in reader.fieldnames:
            clean = col.strip().lower().replace(" ", "_").replace("-", "_")
            field_map[clean] = col

        imported = 0
        skipped = 0
        batch = []
        batch_size = 1000

        for row in reader:
            def get_val(*keys: str, default: str = "") -> str:
                for k in keys:
                    if k in field_map:
                        val = row.get(field_map[k], "").strip()
                        if val:
                            return val
                return default

            pin = get_val("pin_code", "pincode", "pin")
            po_name = get_val("post_office_name", "post_office", "office_name", "officename")
            district = get_val("district", "district_name")
            state = get_val("state", "state_name")
            locality = get_val("locality", "place", "area", default=po_name)
            office_type = get_val("office_type", "type", default="Sub Post Office")
            delivery_status = get_val("delivery_status", "delivery", default="Delivery")
            taluk = get_val("taluk", "tehsil", "mandal")
            division = get_val("division")
            region = get_val("region")
            circle = get_val("circle")
            telephone = get_val("telephone", "phone")

            if not pin or not po_name or len(pin) != 6:
                skipped += 1
                continue

            lat_str = get_val("latitude", "lat")
            lng_str = get_val("longitude", "lng", "lon")
            lat = None
            lng = None
            has_coords = False
            try:
                if lat_str and lng_str:
                    lat = float(lat_str)
                    lng = float(lng_str)
                    has_coords = True
            except (ValueError, TypeError):
                pass

            search_text = f"{po_name} {locality} {taluk} {district} {state} {division}".strip().lower()

            batch.append(
                PostOffice(
                    pin_code=pin,
                    post_office_name=po_name,
                    office_type=office_type,
                    delivery_status=delivery_status,
                    locality=locality,
                    district=district or "Unknown",
                    state=state or "Unknown",
                    taluk=taluk or None,
                    division=division or None,
                    region=region or None,
                    circle=circle or None,
                    telephone=telephone or None,
                    latitude=lat,
                    longitude=lng,
                    has_verified_coords=has_coords,
                    search_text=search_text,
                    dataset_version="IndiaPost-Admin-BulkUpload",
                )
            )
            imported += 1

            if len(batch) >= batch_size:
                db.add_all(batch)
                db.commit()
                batch.clear()

        if batch:
            db.add_all(batch)
            db.commit()
            batch.clear()

        return {
            "imported_count": imported,
            "skipped_count": skipped,
            "total_rows_processed": imported + skipped,
            "message": f"Successfully imported {imported:,} postal records ({skipped:,} invalid/skipped rows)."
        }

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
