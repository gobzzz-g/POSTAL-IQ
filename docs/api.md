# POSTALIQ REST API Reference

The POSTALIQ backend exposes RESTful endpoints versioned under `/api/v1`. Interactive OpenAPI documentation is accessible at `/docs` or `/redoc`.

## Summary Table

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Lightweight service health ping | No |
| `GET` | `/api/v1/ready` | Readiness check verifying DB, TF-IDF vectorizer & ML model | No |
| `POST` | `/api/v1/predict` | Predicts PIN code and post office for address text | No |
| `GET` | `/api/v1/pin/{pin}` | Returns all post offices under official 6-digit PIN | No |
| `GET` | `/api/v1/post-offices` | Paginated search and filtering of post offices | No |
| `GET` | `/api/v1/post-offices/{id}` | Retrieves detailed post office record by ID | No |
| `GET` | `/api/v1/search` | Full-text query on PIN, locality, or office name | No |
| `GET` | `/api/v1/autocomplete` | Fast prefix suggestions for locality/post office | No |
| `POST` | `/api/v1/batch/validate` | Uploads and processes a CSV address batch | No |
| `GET` | `/api/v1/batch/{job_id}` | Retrieves batch processing status and progress | No |
| `GET` | `/api/v1/batch/{job_id}/download` | Downloads resulting enriched CSV file | No |
| `GET` | `/api/v1/history` | Fetches anonymous session-isolated query history | No (Session ID) |
| `DELETE` | `/api/v1/history` | Clears search history for current session | No (Session ID) |
| `POST` | `/api/v1/feedback` | Logs inaccuracy report or user-suggested correction | No |
| `POST` | `/api/v1/admin/login` | Authenticates administrator and returns JWT token | No |
| `GET` | `/api/v1/admin/analytics` | Returns platform query stats, metrics & evaluations | Yes (Bearer JWT) |
| `GET` | `/api/v1/admin/post-offices` | Administrative postal records browser | Yes (Bearer JWT) |
| `POST` | `/api/v1/admin/post-offices` | Creates a verified postal directory record | Yes (Bearer JWT) |
| `PUT` | `/api/v1/admin/post-offices/{id}` | Updates existing postal directory record | Yes (Bearer JWT) |
| `DELETE` | `/api/v1/admin/post-offices/{id}` | Deletes postal record | Yes (Bearer JWT) |

## Example: Postal Prediction

### Request
```http
POST /api/v1/predict HTTP/1.1
Content-Type: application/json

{
  "address_text": "Koramangala 4th Block, Bengaluru Urban, Karnataka",
  "session_id": "sid-demo-123"
}
```

### Response
```json
{
  "status": "matched",
  "query_original": "Koramangala 4th Block, Bengaluru Urban, Karnataka",
  "query_normalized": "koramangala fourth block bengaluru urban karnataka",
  "extracted_entities": {
    "locality": "Koramangala 4th Block",
    "city_or_town": "Bangalore",
    "district": "Bengaluru Urban",
    "state": "Karnataka",
    "pin_code": null,
    "landmarks": [],
    "corrections_applied": {}
  },
  "primary_match": {
    "id": 35,
    "pin_code": "560034",
    "post_office_name": "Koramangala Sub Post Office",
    "office_type": "Sub Post Office",
    "delivery_status": "Delivery",
    "locality": "Koramangala 4th Block",
    "district": "Bengaluru Urban",
    "state": "Karnataka",
    "division": "Bangalore South",
    "circle": "Karnataka Circle",
    "latitude": 12.9352,
    "longitude": 77.6245,
    "has_verified_coords": true,
    "raw_match_score": 98.4,
    "calibrated_confidence": 96.2,
    "confidence_level": "high",
    "evidence": [
      {
        "category": "locality",
        "description": "Verified locality match: 'Koramangala 4th Block' identified in query",
        "is_positive": true,
        "confidence_weight": 1.2
      },
      {
        "category": "district",
        "description": "District agreement: 'Bengaluru Urban' matches address",
        "is_positive": true,
        "confidence_weight": 1.0
      },
      {
        "category": "state",
        "description": "State agreement: 'Karnataka' confirmed",
        "is_positive": true,
        "confidence_weight": 1.0
      }
    ],
    "dataset_version": "IndiaPost-2024.1"
  },
  "alternatives": [],
  "clarification": null,
  "overall_confidence": 0.962,
  "confidence_level": "high",
  "warnings": [],
  "model_version": "ml-logistic-regression-v1.2",
  "dataset_version": "IndiaPost-2024.1",
  "ranking_mode": "ml_ranker",
  "latency_ms": 14.2
}
```
