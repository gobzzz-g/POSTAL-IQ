import json
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from backend.app.database.session import get_db
from backend.app.models.history import SearchHistory

router = APIRouter()

@router.get("/history")
def get_search_history(
    session_id: str = Query(..., description="Anonymous session identifier for privacy isolation"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    records = db.query(SearchHistory).filter(
        SearchHistory.session_id == session_id
    ).order_by(SearchHistory.created_at.desc()).limit(limit).all()

    output = []
    for r in records:
        evidence = []
        if r.match_evidence:
            try:
                evidence = json.loads(r.match_evidence)
            except Exception:
                evidence = []
        output.append({
            "id": r.id,
            "session_id": r.session_id,
            "query_text": r.query_text,
            "query_type": r.query_type,
            "predicted_pin": r.predicted_pin,
            "predicted_post_office": r.predicted_post_office,
            "confidence": round(r.confidence * 100, 1) if r.confidence is not None else 0.0,
            "status": r.status,
            "match_evidence": evidence,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return output

@router.delete("/history")
def clear_search_history(
    session_id: str = Query(..., description="Anonymous session identifier to clear"),
    db: Session = Depends(get_db)
):
    count = db.query(SearchHistory).filter(SearchHistory.session_id == session_id).delete()
    db.commit()
    return {"message": f"Successfully cleared {count} search history records."}

@router.delete("/history/{history_id}")
def delete_single_history_item(
    history_id: int,
    session_id: str = Query(..., description="Session identifier owner"),
    db: Session = Depends(get_db)
):
    rec = db.query(SearchHistory).filter(
        SearchHistory.id == history_id,
        SearchHistory.session_id == session_id
    ).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found for this session."
        )
    db.delete(rec)
    db.commit()
    return {"message": "History item removed."}
