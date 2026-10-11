import os
import sys
import csv
import argparse
from datetime import datetime, timezone
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database.session import SessionLocal, engine, Base
from backend.app.models.post_office import PostOffice
from backend.app.models.locality_alias import LocalityAlias
from backend.app.models.admin_user import AdminUser, ModelVersion, DatasetImport
from backend.app.core.security import hash_password
from backend.app.core.logging import logger, setup_logging
from backend.app.core.config import settings
from backend.app.ml.candidate_retrieval.tfidf_matcher import tfidf_matcher
from backend.app.ml.entity_extraction.extractor import extractor
from backend.app.ml.preprocessing.normalizer import normalizer

def init_db_and_import(
    postal_csv_path: str = "./data/india_post_master.csv",
    alias_csv_path: str = "./data/locality_aliases.csv",
    admin_user: str = "admin",
    admin_pass: str = "PostalIQ@2025Secure",
    force: bool = False
):
    setup_logging()
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Create or verify default Admin User
        existing_admin = db.query(AdminUser).filter(AdminUser.username == admin_user).first()
        if not existing_admin:
            admin = AdminUser(
                username=admin_user,
                email="admin@postaliq.gov.in",
                hashed_password=hash_password(admin_pass),
                full_name="Postal Administrator",
                role="superadmin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            logger.info(f"Created default admin user: '{admin_user}'")
        else:
            logger.info(f"Admin user '{admin_user}' already exists.")

        # 2. Import Post Offices
        current_count = db.query(func.count(PostOffice.id)).scalar() or 0
        should_import = force or (current_count < 1000)

        if should_import and os.path.exists(postal_csv_path):
            logger.info(f"Importing India Post gazetteer records from {postal_csv_path}...")
            # Drop and recreate post_offices table to ensure latest schema columns
            PostOffice.__table__.drop(bind=engine, checkfirst=True)
            PostOffice.__table__.create(bind=engine, checkfirst=True)
            logger.info("Initialized post_offices table with full directory schema.")

            imported = 0
            skipped = 0
            batch = []
            batch_size = 5000

            with open(postal_csv_path, mode="r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    pin = row.get("pin_code", "").strip()
                    po_name = row.get("post_office_name", "").strip()
                    locality = row.get("locality", "").strip() or po_name
                    taluk = row.get("taluk", "").strip()
                    district = row.get("district", "").strip()
                    state = row.get("state", "").strip()

                    if not pin or not po_name or len(pin) != 6:
                        skipped += 1
                        continue

                    has_coords = row.get("has_verified_coords", "false").lower() == "true"
                    lat = float(row.get("latitude")) if row.get("latitude") else None
                    lng = float(row.get("longitude")) if row.get("longitude") else None

                    search_text = f"{po_name} {locality} {taluk} {district} {state} {row.get('division', '')}".lower()

                    batch.append({
                        "pin_code": pin,
                        "post_office_name": po_name,
                        "office_type": row.get("office_type", "Sub Post Office"),
                        "delivery_status": row.get("delivery_status", "Delivery"),
                        "locality": locality,
                        "taluk": taluk,
                        "district": district,
                        "state": state,
                        "division": row.get("division"),
                        "region": row.get("region"),
                        "circle": row.get("circle"),
                        "telephone": row.get("telephone"),
                        "related_suboffice": row.get("related_suboffice"),
                        "related_headoffice": row.get("related_headoffice"),
                        "latitude": lat,
                        "longitude": lng,
                        "has_verified_coords": has_coords,
                        "search_text": search_text,
                        "dataset_version": "IndiaPost-Official-AllIndia-2024"
                    })
                    imported += 1

                    if len(batch) >= batch_size:
                        db.bulk_insert_mappings(PostOffice, batch)
                        db.commit()
                        batch = []
                        logger.info(f"Imported {imported} postal records...")

                if batch:
                    db.bulk_insert_mappings(PostOffice, batch)
                    db.commit()

            logger.info(f"Postal import complete. Imported: {imported}, Skipped: {skipped}")

            # Log dataset import metadata
            db_import = DatasetImport(
                filename=os.path.basename(postal_csv_path),
                version="IndiaPost-Official-AllIndia-2024",
                source="Government of India All India Pincode Directory (OGD Platform data.gov.in / Department of Posts)",
                total_rows=imported + skipped,
                imported_rows=imported,
                skipped_rows=skipped,
                status="completed",
                created_at=datetime.now(timezone.utc)
            )
            db.add(db_import)
            db.commit()
        else:
            logger.info(f"Post office table has {current_count} records. Bulk re-import skipped (use --force to re-import).")

        # 3. Import Locality Aliases
        alias_count = db.query(func.count(LocalityAlias.id)).scalar() or 0
        if (alias_count == 0 or force) and os.path.exists(alias_csv_path):
            logger.info(f"Importing locality aliases from {alias_csv_path}...")
            with open(alias_csv_path, mode="r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                aliases_added = 0
                for row in reader:
                    alias_name = row.get("alias_name", "").strip()
                    std_name = row.get("standard_name", "").strip()
                    pin = row.get("pin_code", "").strip()

                    if not alias_name or not pin:
                        continue

                    existing_alias = db.query(LocalityAlias).filter(
                        LocalityAlias.alias_name == alias_name,
                        LocalityAlias.pin_code == pin
                    ).first()

                    if not existing_alias:
                        al = LocalityAlias(
                            alias_name=alias_name,
                            standard_name=std_name,
                            pin_code=pin,
                            district=row.get("district"),
                            state=row.get("state")
                        )
                        db.add(al)
                        aliases_added += 1
                db.commit()
                logger.info(f"Aliases import complete: {aliases_added} aliases loaded.")

        # 4. Populate Gazetteer & Fit / Load TF-IDF Vectorizer
        districts = [r[0] for r in db.query(PostOffice.district).distinct().all() if r[0]]
        localities = [r[0] for r in db.query(PostOffice.locality).distinct().limit(30000).all() if r[0]]
        all_aliases = db.query(LocalityAlias).all()
        alias_names = [a.alias_name for a in all_aliases]

        extractor.update_gazetteer(districts, localities + alias_names)
        logger.info(f"Updated entity extractor gazetteer with {len(districts)} districts and {len(localities)} localities.")

        # TF-IDF indexer persistence
        artifact_path = os.path.join(settings.MODEL_ARTIFACTS_DIR, "tfidf_indexer.joblib")
        if not force and tfidf_matcher.load(artifact_path):
            logger.info("Loaded cached TF-IDF vectorizer artifact.")
        else:
            logger.info("Fitting TF-IDF vectorizer on authoritative hub and locality corpus...")
            hub_records = db.query(PostOffice).filter(
                (PostOffice.office_type.in_(["Head Post Office", "Sub Post Office"])) |
                (PostOffice.has_verified_coords == True)
            ).limit(25000).all()

            docs = []
            doc_ids = []
            for p in hub_records:
                doc_str = f"{p.post_office_name} {p.locality} {p.district} {p.state} {p.division or ''}"
                docs.append(doc_str)
                doc_ids.append(p.id)

            tfidf_matcher.fit(docs, doc_ids)
            tfidf_matcher.save(artifact_path)
            logger.info(f"Fitted and cached TF-IDF indexer with {len(docs)} documents.")

    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="POSTALIQ Postal Dataset Importer")
    parser.add_argument("--file", default="./data/india_post_master.csv", help="Path to master postal CSV")
    parser.add_argument("--aliases", default="./data/locality_aliases.csv", help="Path to locality aliases CSV")
    parser.add_argument("--force", action="store_true", help="Force reload of entire dataset")
    args = parser.parse_args()
    init_db_and_import(postal_csv_path=args.file, alias_csv_path=args.aliases, force=args.force)
