import os
import sys
import csv
import argparse
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from sqlalchemy.orm import Session

from backend.app.database.session import SessionLocal, engine, Base
from backend.app.models.post_office import PostOffice
from backend.app.models.locality_alias import LocalityAlias
from backend.app.models.admin_user import AdminUser, ModelVersion, DatasetImport
from backend.app.core.security import hash_password
from backend.app.core.logging import logger, setup_logging
from backend.app.ml.candidate_retrieval.tfidf_matcher import tfidf_matcher
from backend.app.ml.entity_extraction.extractor import extractor
from backend.app.ml.preprocessing.normalizer import normalizer

def init_db_and_import(
    postal_csv_path: str = "./data/india_post_master.csv",
    alias_csv_path: str = "./data/locality_aliases.csv",
    admin_user: str = "admin",
    admin_pass: str = "PostalIQ@2025Secure"
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
                is_active=1
            )
            db.add(admin)
            db.commit()
            logger.info(f"Created default admin user: '{admin_user}'")
        else:
            logger.info(f"Admin user '{admin_user}' already exists.")

        # 2. Import Post Offices
        if os.path.exists(postal_csv_path):
            logger.info(f"Importing postal records from {postal_csv_path}...")
            with open(postal_csv_path, mode="r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                imported = 0
                updated = 0
                skipped = 0
                for row in reader:
                    pin = row.get("pin_code", "").strip()
                    po_name = row.get("post_office_name", "").strip()
                    locality = row.get("locality", "").strip()
                    district = row.get("district", "").strip()
                    state = row.get("state", "").strip()

                    if not pin or not po_name:
                        skipped += 1
                        continue

                    has_coords = row.get("has_verified_coords", "false").lower() == "true"
                    lat = float(row.get("latitude")) if row.get("latitude") else None
                    lng = float(row.get("longitude")) if row.get("longitude") else None

                    search_text = f"{po_name} {locality} {district} {state} {row.get('division', '')}".lower()

                    existing = db.query(PostOffice).filter(
                        PostOffice.pin_code == pin,
                        PostOffice.post_office_name == po_name
                    ).first()

                    if not existing:
                        po = PostOffice(
                            pin_code=pin,
                            post_office_name=po_name,
                            office_type=row.get("office_type", "Sub Post Office"),
                            delivery_status=row.get("delivery_status", "Delivery"),
                            locality=locality,
                            district=district,
                            state=state,
                            division=row.get("division"),
                            region=row.get("region"),
                            circle=row.get("circle"),
                            latitude=lat,
                            longitude=lng,
                            has_verified_coords=has_coords,
                            search_text=search_text,
                            dataset_version="IndiaPost-2024.1"
                        )
                        db.add(po)
                        imported += 1
                    else:
                        existing.locality = locality
                        existing.district = district
                        existing.state = state
                        existing.latitude = lat
                        existing.longitude = lng
                        existing.has_verified_coords = has_coords
                        existing.search_text = search_text
                        updated += 1

                db.commit()
                logger.info(f"Postal import complete. Added: {imported}, Updated: {updated}, Skipped: {skipped}")

                # Log dataset import
                db_import = DatasetImport(
                    filename=os.path.basename(postal_csv_path),
                    version="IndiaPost-2024.1",
                    source="OGD Platform India / India Post Directory",
                    total_rows=imported + updated + skipped,
                    imported_rows=imported + updated,
                    skipped_rows=skipped,
                    status="completed"
                )
                db.add(db_import)
                db.commit()

        # 3. Import Locality Aliases
        if os.path.exists(alias_csv_path):
            logger.info(f"Importing locality aliases from {alias_csv_path}...")
            with open(alias_csv_path, mode="r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                alias_count = 0
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
                        alias_count += 1
                db.commit()
                logger.info(f"Aliases import complete: {alias_count} aliases loaded.")

        # 4. Populate Gazetteer & Fit TF-IDF Vectorizer
        all_pos = db.query(PostOffice).all()
        all_aliases = db.query(LocalityAlias).all()

        docs = []
        doc_ids = []
        districts = set()
        localities = set()
        vocab_words = set()

        for p in all_pos:
            doc_str = f"{p.post_office_name} {p.locality} {p.district} {p.state} {p.division or ''}"
            docs.append(doc_str)
            doc_ids.append(p.id)
            if p.district:
                districts.add(p.district)
                vocab_words.update(p.district.split())
            if p.locality:
                localities.add(p.locality)
                vocab_words.update(p.locality.split())
            vocab_words.update(p.post_office_name.split())

        for a in all_aliases:
            localities.add(a.alias_name)
            vocab_words.update(a.alias_name.split())

        extractor.update_gazetteer(list(districts), list(localities))
        normalizer.update_vocabulary(list(vocab_words))
        tfidf_matcher.fit(docs, doc_ids)
        logger.info(f"Fitted TF-IDF indexer with {len(docs)} postal documents.")

    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="POSTALIQ Postal Dataset Importer")
    parser.add_argument("--file", default="./data/india_post_master.csv", help="Path to master postal CSV")
    parser.add_argument("--aliases", default="./data/locality_aliases.csv", help="Path to locality aliases CSV")
    args = parser.parse_args()
    init_db_and_import(postal_csv_path=args.file, alias_csv_path=args.aliases)
