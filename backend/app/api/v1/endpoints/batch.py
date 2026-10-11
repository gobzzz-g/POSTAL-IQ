import io
import csv
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Response, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.schemas.batch import BatchJobStatus
from backend.app.services.batch_service import batch_service

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_ROW_COUNT = 500

@router.post("/batch/validate", response_model=BatchJobStatus)
async def upload_batch_csv(
    file: UploadFile = File(...),
    address_column: str = Form("address"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a standard .csv file."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size limit of {MAX_FILE_SIZE // (1024 * 1024)}MB."
        )

    try:
        text_stream = io.StringIO(content.decode("utf-8-sig", errors="replace"))
        reader = csv.DictReader(text_stream)
        if not reader.fieldnames:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV file contains no header row or columns."
            )

        # Check if address_column exists in headers (case-insensitive check)
        matched_col = None
        for col in reader.fieldnames:
            if col.strip().lower() == address_column.strip().lower():
                matched_col = col
                break

        if not matched_col:
            # Fallback to first column or address-like column
            for col in reader.fieldnames:
                if any(k in col.lower() for k in ["address", "addr", "location", "street"]):
                    matched_col = col
                    break
            if not matched_col:
                matched_col = reader.fieldnames[0]

        rows = list(reader)
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file contains no data rows."
            )

        if len(rows) > MAX_ROW_COUNT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds row limit of {MAX_ROW_COUNT} addresses. Found {len(rows)} rows."
            )

        job_id = batch_service.create_batch_job(
            filename=file.filename,
            rows=rows,
            address_col=matched_col,
            db=db
        )
        return batch_service.get_job_status(job_id)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading and processing CSV file: {str(e)}"
        )

@router.get("/batch/{job_id}", response_model=BatchJobStatus)
def get_batch_job(job_id: str):
    job = batch_service.get_job_status(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch job {job_id} not found."
        )
    return job

@router.get("/batch/{job_id}/download")
def download_batch_results(job_id: str):
    csv_data = batch_service.generate_csv_export(job_id)
    if not csv_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch job {job_id} not found or has no completed results."
        )

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=postaliq_validation_{job_id[:8]}.csv"
        }
    )
