# POSTALIQ Postal Dataset Documentation

## Data Source and Provenance

- **Primary Source**: Open Government Data (OGD) Platform India (`data.gov.in`) & India Post Department of Posts, Ministry of Communications, Government of India.
- **Dataset Identification**: All India Pincode Directory (Standard Gazette).
- **Licence**: National Data Sharing and Accessibility Policy (NDSAP) / Open Government Data License - India.
- **Freshness**: Reference directory updated for major national distribution circles, Head Offices (HO), Sub Post Offices (SO), and Branch Offices (BO).

## Data Schema

The dataset contains the following normalized columns:
- `pin_code`: Official 6-digit Indian Postal Index Number (PIN), validating `^[1-9][0-9]{5}$`.
- `post_office_name`: Official postal facility name as registered with Department of Posts.
- `office_type`: Head Post Office, Sub Post Office, or Branch Post Office.
- `delivery_status`: Delivery or Non-Delivery office.
- `locality`: Primary serving urban locality or revenue village.
- `district`: Administrative revenue district.
- `state`: State or Union Territory of the Republic of India.
- `division`: Postal division.
- `region`: Postal administrative region.
- `circle`: Postal state circle.
- `latitude` / `longitude`: Verified coordinate centroids (never manufactured or estimated).
- `has_verified_coords`: Boolean flag indicating whether coordinate data is verified.

## Local Demonstration and Bulk Import

The application includes an idempotent import command:
```bash
python -m backend.scripts.import_dataset --file data/india_post_master.csv --aliases data/locality_aliases.csv
```
This script handles deduplication, column validation, search vector indexing, and rejected row reporting.
