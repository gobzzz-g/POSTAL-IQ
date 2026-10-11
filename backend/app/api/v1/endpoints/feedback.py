from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database.session import get_db
from backend.app.models.feedback import FeedbackReport
from backend.app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackStatusUpdate

router = APIRouter()

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    if not data.query_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Original address query text is required for error reporting."
        )

    report = FeedbackReport(
        query_text=data.query_text.strip(),
        predicted_pin=data.predicted_pin,
        predicted_post_office=data.predicted_post_office,
        suggested_pin=data.suggested_pin,
        suggested_post_office=data.suggested_post_office,
        user_comment=data.user_comment,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/feedback", response_model=List[FeedbackResponse])
def list_feedback_reports(db: Session = Depends(get_db)):
    return db.query(FeedbackReport).order_by(FeedbackReport.created_at.desc()).limit(50).all()

@router.put("/feedback/{feedback_id}/status", response_model=FeedbackResponse)
def update_feedback_status(feedback_id: int, status_update: FeedbackStatusUpdate, db: Session = Depends(get_db)):
    report = db.query(FeedbackReport).filter(FeedbackReport.id == feedback_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback report {feedback_id} not found."
        )
    report.status = status_update.status
    db.commit()
    db.refresh(report)
    return report
