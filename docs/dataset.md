# POSTALIQ Dataset & Postal Gazetteer Documentation

## 1. Provenance and Authoritative Sourcing

POSTALIQ relies strictly on official postal data provided by:
- **Department of Posts, Ministry of Communications, Government of India**.
- **Open Government Data (OGD) Platform India** (`data.gov.in`).
- **Gazette Directory**: All India Pincode Directory (Standard Gazette).

The data is licensed under the **National Data Sharing and Accessibility Policy (NDSAP) / Open Government Data License - India**.

## 2. Integrity and Verification Standards

1. **Strict 6-Digit PIN Code Format**: Every PIN code strictly validates `^[1-9][0-9]{5}$`. Indian postal PINs never start with `0`.
2. **GPS Coordinate Verification**: Only records with verified geodetic centroids are assigned `has_verified_coords = true`. The platform **never manufactures synthetic GPS coordinates** for unverified rural post offices.
3. **Office Hierarchy**: Post offices are categorized by official Department of Posts hierarchy:
   - **Head Post Office (HO)**: Principal accounting and distribution hub.
   - **Sub Post Office (SO)**: Urban or town delivery facility.
   - **Branch Post Office (BO)**: Local delivery node.
4. **Delivery Status**: Distinguishes Delivery vs Non-Delivery offices.

## 3. Database Schema

The relational schema comprises:
- `post_offices`: Canonical postal facilities, administrative division, circle, and coordinates.
- `locality_aliases`: Mapping of colloquial acronyms, short names (e.g. `CP` → `Connaught Place`, `BKC` → `Bandra Kurla Complex`), and frequent spelling variants.
- `search_history`: Anonymous session-isolated query records.
- `feedback_reports`: Inaccuracy reports and user suggestions.
- `dataset_imports`: Audit log of batch file imports and row rejection counts.
- `model_versions`: Evaluated ML rankers and benchmark accuracy scores.
- `admin_users`: Administrative accounts with bcrypt-hashed credentials.

## 4. Idempotent Import Script

To re-seed or update postal records:
```bash
python -m backend.scripts.import_dataset --file data/india_post_master.csv --aliases data/locality_aliases.csv
```
The script computes search vectors, updates the gazetteer, fits character n-gram TF-IDF matrices, and logs row outcomes without duplicating existing records.
