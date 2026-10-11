import uuid
import csv
import io
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.schemas.batch import BatchJobStatus, BatchRecordResult
from backend.app.schemas.prediction import PredictionRequest
from backend.app.services.prediction_service import prediction_service

# In-memory batch job store
BATCH_JOBS: Dict[str, BatchJobStatus] = {}

class BatchService:
    def create_batch_job(self, filename: str, rows: List[Dict[str, str]], address_col: str, db: Session) -> str:
        job_id = str(uuid.uuid4())
        
        job_status = BatchJobStatus(
            job_id=job_id,
            filename=filename,
            total_records=len(rows),
            processed_records=0,
            matched_count=0,
            ambiguous_count=0,
            unmatched_count=0,
            conflict_count=0,
            invalid_count=0,
            status="processing",
            created_at=datetime.now(timezone.utc),
            results=[]
        )
        BATCH_JOBS[job_id] = job_status

        # Execute processing
        self._process_rows(job_id, rows, address_col, db)
        return job_id

    def _process_rows(self, job_id: str, rows: List[Dict[str, str]], address_col: str, db: Session):
        job = BATCH_JOBS.get(job_id)
        if not job:
            return

        for idx, row in enumerate(rows):
            raw_address = row.get(address_col, "").strip() if row.get(address_col) else ""
            
            # Step 1: Reject empty or malformed input immediately
            if not raw_address or len(raw_address) < 3 or not any(c.isalnum() for c in raw_address):
                job.results.append(BatchRecordResult(
                    row_index=idx + 1,
                    original_address=raw_address,
                    normalized_address="",
                    predicted_pin=None,
                    post_office_name=None,
                    district=None,
                    state=None,
                    status="invalid_input",
                    confidence=0.0,
                    confidence_level="none",
                    suggested_alternative=None,
                    review_required=True,
                    notes="Empty or malformed address row"
                ))
                job.invalid_count += 1
                job.processed_records += 1
                continue

            try:
                pred = prediction_service.predict_address(
                    db,
                    PredictionRequest(address_text=raw_address, session_id=f"batch-{job_id}")
                )
                
                primary = pred.primary_match
                if pred.status == "matched" and primary:
                    job.matched_count += 1
                    status = "matched"
                    alt_desc = None
                    review = False
                    note = None
                elif pred.status == "ambiguous" and primary:
                    job.ambiguous_count += 1
                    status = "ambiguous"
                    alt_desc = f"Alternative: {pred.alternatives[0].post_office_name} ({pred.alternatives[0].pin_code})" if pred.alternatives else None
                    review = True
                    note = pred.warnings[0] if pred.warnings else None
                elif pred.status == "conflict":
                    job.conflict_count += 1
                    status = "conflict"
                    alt_desc = None
                    review = True
                    note = pred.warnings[0] if pred.warnings else "Geographic conflict between locality and region"
                elif pred.status == "invalid_input":
                    job.invalid_count += 1
                    status = "invalid_input"
                    alt_desc = None
                    review = True
                    note = pred.warnings[0] if pred.warnings else "Invalid address input"
                else:
                    job.unmatched_count += 1
                    status = "unmatched"
                    alt_desc = None
                    review = True
                    note = pred.warnings[0] if pred.warnings else "Insufficient evidence to identify verified Indian PIN code. Please specify city, district, or landmark."

                job.results.append(BatchRecordResult(
                    row_index=idx + 1,
                    original_address=raw_address,
                    normalized_address=pred.query_normalized,
                    predicted_pin=primary.pin_code if primary else None,
                    post_office_name=primary.post_office_name if primary else None,
                    district=primary.district if primary else None,
                    state=primary.state if primary else None,
                    confidence=primary.calibrated_confidence if primary else 0.0,
                    confidence_level=pred.confidence_level,
                    status=status,
                    suggested_alternative=alt_desc,
                    review_required=review,
                    notes=note
                ))
            except Exception as e:
                job.results.append(BatchRecordResult(
                    row_index=idx + 1,
                    original_address=raw_address,
                    normalized_address="",
                    predicted_pin=None,
                    post_office_name=None,
                    district=None,
                    state=None,
                    status="invalid_input" if len(raw_address) < 3 else "error",
                    confidence=0.0,
                    confidence_level="none",
                    suggested_alternative=None,
                    review_required=True,
                    notes=str(e)
                ))
                job.invalid_count += 1

            job.processed_records += 1

        job.status = "completed"
        job.completed_at = datetime.now(timezone.utc)

    def get_job_status(self, job_id: str) -> Optional[BatchJobStatus]:
        return BATCH_JOBS.get(job_id)

    def generate_csv_export(self, job_id: str) -> Optional[str]:
        job = BATCH_JOBS.get(job_id)
        if not job:
            return None

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Row", "Original Address", "Normalized Address", "Predicted PIN",
            "Post Office", "District", "State", "Confidence (%)", "Status",
            "Review Required", "Suggested Alternative", "Notes"
        ])

        for r in job.results:
            writer.writerow([
                r.row_index,
                r.original_address,
                r.normalized_address,
                r.predicted_pin or "",
                r.post_office_name or "",
                r.district or "",
                r.state or "",
                f"{r.confidence:.1f}",
                r.status,
                "YES" if r.review_required else "NO",
                r.suggested_alternative or "",
                r.notes or ""
            ])

        return output.getvalue()

batch_service = BatchService()
