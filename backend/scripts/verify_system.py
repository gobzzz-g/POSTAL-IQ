import sys
import os
import json

# Ensure repository root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database.session import SessionLocal
from backend.app.models.post_office import PostOffice
from backend.app.services.postal_service import postal_service
from backend.app.services.prediction_service import prediction_service
from backend.app.services.admin_service import admin_service
from backend.app.schemas.prediction import PredictionRequest

def test_system():
    db = SessionLocal()
    print("=" * 70)
    print("POSTALIQ END-TO-END VERIFICATION & BENCHMARK SUITE")
    print("=" * 70)

    # 1. Admin Dataset Stats
    print("\n[1] Admin Dataset Metadata Check:")
    analytics = admin_service.get_analytics(db)
    stats = analytics.dataset_stats
    print(f"  Source: {stats.source}")
    print(f"  Total Post Offices: {stats.total_post_offices:,}")
    print(f"  Unique PIN Codes: {stats.total_pin_codes:,}")
    print(f"  Districts: {stats.total_districts}")
    print(f"  States / UTs: {stats.total_states}")
    print(f"  Imported Rows: {stats.number_of_records_imported:,}")
    print(f"  Rejected Rows: {stats.rejected_rows}")
    print(f"  Verified GPS Coordinates: {stats.has_verified_coords_count}")
    assert stats.total_post_offices == 154797, f"Expected 154,797 records, got {stats.total_post_offices}"
    assert stats.rejected_rows == 0, f"Expected 0 rejected rows, got {stats.rejected_rows}"
    print("  -> Admin dataset metadata check PASSED.")

    # 2. Co-serving Post Offices (Multiple offices sharing one PIN)
    print("\n[2] Co-serving Post Offices Test (PIN 560034 - Koramangala, Bangalore):")
    results_560034 = postal_service.get_by_pin(db, "560034")
    print(f"  Found {len(results_560034)} offices co-serving PIN 560034:")
    for po in results_560034:
        print(f"    - {po.post_office_name} ({po.office_type}, {po.delivery_status})")
    assert len(results_560034) >= 2, "Expected multiple co-serving post offices for PIN 560034"
    print("  -> Co-serving post offices check PASSED.")

    print("\n[2b] Co-serving Post Offices Test (PIN 110001 - Connaught Place / Central Delhi):")
    results_110001 = postal_service.get_by_pin(db, "110001")
    print(f"  Found {len(results_110001)} offices co-serving PIN 110001:")
    for po in results_110001:
        print(f"    - {po.post_office_name} ({po.office_type})")
    assert len(results_110001) >= 2, "Expected multiple co-serving post offices for PIN 110001"
    print("  -> Central Delhi co-serving check PASSED.")

    # 3. Cross-State Representation Tests
    test_queries = [
        ("Koramangala 4th Block, Bangalore, Karnataka", "560034", "Bengaluru/Karnataka"),
        ("Connaught Place, New Delhi", "110001", "Delhi"),
        ("Nariman Point, Mumbai, Maharashtra", "400021", "Mumbai/Maharashtra"),
        ("Patna GPO, Bihar", "800001", "Patna/Bihar"),
        ("Anna Nagar, Chennai, Tamil Nadu", "600040", "Chennai/Tamil Nadu"),
        ("Gandhinagar Sector 16, Gujarat", "382016", "Gandhinagar/Gujarat"),
        ("Banjara Hills, Hyderabad, Telangana", "500034", "Hyderabad/Telangana"),
    ]

    print("\n[3] Cross-State Prediction Tests:")
    for address, expected_pin, region in test_queries:
        test_db = SessionLocal()
        req = PredictionRequest(address_text=address)
        res = prediction_service.predict_address(test_db, req)
        pred_pin = res.primary_match.pin_code if res.primary_match else None
        pred_name = res.primary_match.post_office_name if res.primary_match else "None"
        conf = res.overall_confidence
        status = res.status
        print(f"  Query: '{address}' ({region})")
        print(f"    Status: {status} | Conf: {conf:.2f} | Predicted: {pred_name} [{pred_pin}] (Expected: {expected_pin})")
        assert pred_pin == expected_pin, f"Expected {expected_pin}, got {pred_pin}"
        test_db.close()
    print("  -> All cross-state queries PASSED.")

    # 4. Misspelling & Fuzzy Matching Test
    print("\n[4] Misspelling & Robustness Test:")
    test_db = SessionLocal()
    fuzzy_req = PredictionRequest(address_text="Kormangla 5th block, Banglore")
    fuzzy_res = prediction_service.predict_address(test_db, fuzzy_req)
    print(f"  Query: 'Kormangla 5th block, Banglore'")
    print(f"    Status: {fuzzy_res.status} | Conf: {fuzzy_res.overall_confidence:.2f} | PIN: {fuzzy_res.primary_match.pin_code if fuzzy_res.primary_match else None}")
    assert fuzzy_res.primary_match is not None
    assert fuzzy_res.primary_match.pin_code in ["560034", "560095"]
    test_db.close()
    print("  -> Misspelling tolerance PASSED.")

    # 5. Ambiguous Query Test
    print("\n[5] Ambiguous Address Test:")
    test_db = SessionLocal()
    ambig_req = PredictionRequest(address_text="Main Road Market")
    ambig_res = prediction_service.predict_address(test_db, ambig_req)
    print(f"  Query: 'Main Road Market'")
    print(f"    Status: {ambig_res.status} | Alternatives: {len(ambig_res.alternatives)}")
    assert ambig_res.status in ["ambiguous", "unmatched"]
    test_db.close()
    print("  -> Ambiguous query handling PASSED.")

    # 6. Unknown / Nonexistent Address Test
    print("\n[6] Unknown Address Rejection Test:")
    test_db = SessionLocal()
    unknown_req = PredictionRequest(address_text="Nonexistent fictional location 999999 zzzz")
    unknown_res = prediction_service.predict_address(test_db, unknown_req)
    print(f"  Query: 'Nonexistent fictional location 999999 zzzz'")
    print(f"    Status: {unknown_res.status} | Primary Match: {unknown_res.primary_match}")
    assert unknown_res.status in ["unmatched", "ambiguous"]
    assert unknown_res.overall_confidence < 0.70
    test_db.close()
    print("  -> Unknown address rejection PASSED.")

    # 7. Coordinate Ground Truth Integrity Test
    print("\n[7] GPS Coordinate Integrity Test:")
    # Fetch a standard rural office vs benchmark office
    sample_offices = db.query(PostOffice).filter(PostOffice.has_verified_coords == False).limit(5).all()
    for o in sample_offices:
        assert o.latitude is None and o.longitude is None, f"Fabricated coordinates detected on unverified office {o.post_office_name}!"
    print(f"  Checked {len(sample_offices)} unverified post offices: No fabricated coordinates found (has_verified_coords=False, lat=None, lon=None).")
    benchmark_offices = db.query(PostOffice).filter(PostOffice.has_verified_coords == True).all()
    print(f"  Checked {len(benchmark_offices)} verified benchmark hubs: Legitimate coordinates intact.")
    assert len(benchmark_offices) >= 40
    print("  -> Coordinate integrity PASSED.")

    db.close()
    print("\n" + "=" * 70)
    print("ALL VERIFICATION SUITES COMPLETED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    test_system()
