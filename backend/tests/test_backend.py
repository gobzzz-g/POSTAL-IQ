import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database.session import Base, get_db
from backend.app.ml.preprocessing.normalizer import normalizer
from backend.app.ml.preprocessing.abbreviations import expand_abbreviations
from backend.app.ml.entity_extraction.extractor import extractor
from backend.app.ml.confidence.calibrator import calibrate_candidate_confidence
from backend.scripts.import_dataset import init_db_and_import

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db_and_import()

def test_normalization_and_abbreviations():
    raw = "FLT 402, 4th Blk, Opp Metro Stn, Kormangla, KA"
    expanded = expand_abbreviations(raw)
    assert "flat" in expanded.lower()
    assert "block" in expanded.lower()
    assert "opposite" in expanded.lower()
    assert "karnataka" in expanded.lower()

    norm, corrections = normalizer.normalize(raw)
    assert "flat" in norm
    assert any(term in norm for term in ["koramangala", "kormangala", "kormangla"])

def test_entity_extraction():
    text = "flat 102 4th cross koramangala bangalore urban karnataka 560034"
    entities = extractor.extract(text)
    assert entities["pin_code"] == "560034"
    assert entities["state"] == "Karnataka"
    assert entities["district"] == "Bengaluru Urban"

def test_pin_lookup_valid():
    response = client.get("/api/v1/pin/560034")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["pin_code"] == "560034"
    assert "Koramangala" in data[0]["post_office_name"]

def test_pin_lookup_invalid_format():
    response = client.get("/api/v1/pin/12345")  # only 5 digits
    assert response.status_code == 400

    response2 = client.get("/api/v1/pin/012345")  # starts with 0
    assert response2.status_code == 400

def test_pin_lookup_not_found():
    response = client.get("/api/v1/pin/999999")
    assert response.status_code == 404

def test_predict_known_address():
    payload = {
        "address_text": "Koramangala 4th Block, Bengaluru, Karnataka"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("matched", "ambiguous")
    assert data["primary_match"] is not None
    assert data["primary_match"]["pin_code"] == "560034"
    assert data["overall_confidence"] >= 0.70

def test_predict_misspelled_locality():
    payload = {
        "address_text": "4th Cross, Kormangla, Bangalore, Karnataka"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["primary_match"] is not None
    assert data["primary_match"]["pin_code"] == "560034"

def test_predict_contradictory_district_safeguard():
    # Address text mentions Pune district explicitly, but also Connaught Place (Delhi)
    payload = {
        "address_text": "Connaught Place, Pune, Maharashtra"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    # It must either flag warnings or choose a Pune candidate / have degraded confidence
    if data["primary_match"] and data["primary_match"]["district"] != "Pune":
        assert any("differs" in w or "Notice" in w for w in data["warnings"]) or data["overall_confidence"] < 0.85

def test_predict_unsupported_unknown_address():
    payload = {
        "address_text": "Random fictional nonexistent place xyz 999999 zzz"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unmatched"
    assert data["primary_match"] is None

def test_clarification_response_flow():
    # Ambiguous or clarification input
    payload = {
        "address_text": "Main Road",
        "clarification_answer": "Bengaluru Urban, Karnataka"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "bengaluru" in data["query_normalized"]

def test_search_history_privacy_isolation():
    session_a = "session-alice-123"
    session_b = "session-bob-456"

    # Alice searches
    client.post("/api/v1/predict", json={"address_text": "Koramangala Bangalore", "session_id": session_a})

    # Bob searches
    client.post("/api/v1/predict", json={"address_text": "Cyber City Gurugram", "session_id": session_b})

    # Alice views history
    res_a = client.get(f"/api/v1/history?session_id={session_a}")
    assert res_a.status_code == 200
    items_a = res_a.json()
    assert all(i["session_id"] == session_a for i in items_a)
    assert not any("Cyber City" in i["query_text"] for i in items_a)

def test_feedback_submission():
    payload = {
        "query_text": "Test Street, Bengaluru",
        "predicted_pin": "560001",
        "suggested_pin": "560034",
        "user_comment": "This locality is near Koramangala 4th block"
    }
    response = client.post("/api/v1/feedback", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["suggested_pin"] == "560034"

def test_admin_authentication_and_protection():
    # Unauthenticated attempt to get analytics
    res_unauth = client.get("/api/v1/admin/analytics")
    assert res_unauth.status_code == 401

    # Login
    login_res = client.post("/api/v1/admin/login", json={
        "username": "admin",
        "password": "PostalIQ@2025Secure"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    token = token_data["access_token"]
    assert token is not None

    # Authenticated access
    headers = {"Authorization": f"Bearer {token}"}
    res_auth = client.get("/api/v1/admin/analytics", headers=headers)
    assert res_auth.status_code == 200
    analytics = res_auth.json()
    assert analytics["dataset_stats"]["total_post_offices"] >= 50
    assert len(analytics["model_evaluations"]) >= 1

def test_batch_validation_csv():
    csv_content = (
        "address\n"
        "Koramangala 4th Block Bengaluru Karnataka\n"
        "Cyber City Gurugram Haryana\n"
        "Connaught Place New Delhi\n"
    )
    files = {"file": ("test_addresses.csv", csv_content.encode("utf-8"), "text/csv")}
    response = client.post("/api/v1/batch/validate", files=files)
    assert response.status_code == 200
    job = response.json()
    assert job["total_records"] == 3
    assert job["status"] == "completed"
    assert job["matched_count"] >= 2
    assert len(job["results"]) == 3

    # Test download
    job_id = job["job_id"]
    download_res = client.get(f"/api/v1/batch/{job_id}/download")
    assert download_res.status_code == 200
    assert "Predicted PIN" in download_res.text


# ==========================================
# REGRESSION TEST SUITE (Critical Postal Pipeline Defects)
# ==========================================

def test_regression_1_verified_patna_address():
    res = client.post("/api/v1/predict", json={
        "address_text": "Patna General Post Office, Station Road, Patna, Bihar"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "matched"
    assert data["primary_match"] is not None
    assert data["primary_match"]["pin_code"] == "800001"
    assert data["primary_match"]["district"] == "Patna"
    assert data["primary_match"]["state"] == "Bihar"
    assert data["overall_confidence"] >= 0.85

def test_regression_2_verified_connaught_place():
    res = client.post("/api/v1/predict", json={
        "address_text": "Connaught Place, New Delhi, Delhi"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "matched"
    assert data["primary_match"] is not None
    assert data["primary_match"]["pin_code"] == "110001"
    assert data["primary_match"]["district"] == "New Delhi"
    assert data["overall_confidence"] >= 0.85

def test_regression_3_verified_hauz_khas():
    res = client.post("/api/v1/predict", json={
        "address_text": "Hauz Khas, South Delhi, Delhi"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "matched"
    assert data["primary_match"] is not None
    assert data["primary_match"]["pin_code"] == "110016"
    assert data["primary_match"]["district"] == "South Delhi"
    assert data["overall_confidence"] >= 0.85

def test_regression_4_gandhipuram_coimbatore_no_chennai_acceptance():
    res = client.post("/api/v1/predict", json={
        "address_text": "Gandhipuram, Coimbatore, Tamil Nadu"
    })
    assert res.status_code == 200
    data = res.json()
    # Must never accept a Chennai candidate when user specified Coimbatore
    if data["primary_match"]:
        assert data["primary_match"]["district"] != "Chennai"
        assert data["primary_match"]["pin_code"] != "600017"
        assert data["primary_match"]["district"] == "Coimbatore"
        assert data["primary_match"]["pin_code"] == "641012"
    else:
        assert data["status"] == "unmatched"

def test_regression_5_misspelled_gandhipurm_variant():
    res = client.post("/api/v1/predict", json={
        "address_text": "Gandhipurm, Coimbatore, Tamil Nadu"
    })
    assert res.status_code == 200
    data = res.json()
    # Must never accept Chennai (T Nagar 600017)
    if data["primary_match"]:
        assert data["primary_match"]["district"] != "Chennai"
        assert data["primary_match"]["pin_code"] != "600017"
        assert data["primary_match"]["pin_code"] == "641012"
    else:
        assert data["status"] == "unmatched"

def test_regression_6_unknown_locality_imaginary_state_no_unrelated_confident_match():
    res = client.post("/api/v1/predict", json={
        "address_text": "Unknown locality xyzqv, Nowhere District, Imaginary State"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "unmatched"
    assert data["primary_match"] is None
    assert data["overall_confidence"] == 0.0

def test_regression_7_darya_ganj_and_shakarpur_local_candidates():
    # Darya Ganj
    res1 = client.post("/api/v1/predict", json={
        "address_text": "Darya Ganj, Central Delhi, Delhi"
    })
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["status"] in ("matched", "ambiguous")
    assert d1["primary_match"] is not None
    assert d1["primary_match"]["pin_code"] == "110002"
    assert d1["primary_match"]["district"] == "Central Delhi"
    # Ensure alternatives do not contain contradictory states or distant unrelated cities
    for alt in d1["alternatives"]:
        assert alt["state"] == "Delhi"

    # Shakarpur
    res2 = client.post("/api/v1/predict", json={
        "address_text": "Shakarpur, East Delhi, Delhi"
    })
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["status"] in ("matched", "ambiguous")
    assert d2["primary_match"] is not None
    assert d2["primary_match"]["pin_code"] == "110092"
    assert d2["primary_match"]["district"] == "East Delhi"

def test_regression_8_conflicting_locality_and_city_trigger():
    res = client.post("/api/v1/predict", json={
        "address_text": "Darya Ganj, Patna, Bihar"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("conflict", "unmatched")
    assert any("conflict" in w.lower() or "belongs" in w.lower() or "insufficient" in w.lower() for w in data["warnings"])

def test_regression_9_empty_input_invalid_input():
    res = client.post("/api/v1/predict", json={
        "address_text": ""
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "invalid_input"
    assert data["overall_confidence"] == 0.0
    assert data["primary_match"] is None

def test_regression_10_csv_export_preserves_statuses_confidence_and_review_flags():
    csv_content = (
        'address\n'
        '"Patna General Post Office, Station Road, Patna, Bihar"\n'
        '"Gandhipuram, Coimbatore, Tamil Nadu"\n'
        '"Unknown locality xyzqv, Nowhere District, Imaginary State"\n'
        '"Darya Ganj, Patna, Bihar"\n'
        '""\n'
    )
    files = {"file": ("validation_test.csv", csv_content.encode("utf-8"), "text/csv")}
    upload_res = client.post("/api/v1/batch/validate", files=files)
    assert upload_res.status_code == 200
    job = upload_res.json()
    assert job["total_records"] == 5

    # Check download CSV
    job_id = job["job_id"]
    dl = client.get(f"/api/v1/batch/{job_id}/download")
    assert dl.status_code == 200
    lines = [line.strip() for line in dl.text.strip().split("\n")]
    assert len(lines) == 6  # header + 5 rows

    # Header check
    assert "Original Address,Normalized Address,Predicted PIN,Post Office,District,State,Confidence (%),Status,Review Required,Suggested Alternative,Notes" in lines[0]

    # Row 1: Patna -> matched, Review: NO
    assert "800001" in lines[1]
    assert "Patna" in lines[1]
    assert "matched,NO" in lines[1]

    # Row 2: Gandhipuram -> matched Coimbatore (641012), not Chennai
    assert "641012" in lines[2]
    assert "Coimbatore" in lines[2]
    assert "matched,NO" in lines[2]

    # Row 3: Unknown locality -> unmatched, Review: YES
    assert "unmatched,YES" in lines[3]
    assert "600017" not in lines[3]  # No Chennai hallucination
    assert "500032" not in lines[3]  # No Hyderabad hallucination

    # Row 4: Darya Ganj, Patna, Bihar -> conflict, Review: YES
    assert "conflict,YES" in lines[4]

    # Row 5: Empty row -> invalid_input, Review: YES
    assert "invalid_input,YES" in lines[5]

