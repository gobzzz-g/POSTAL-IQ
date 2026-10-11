from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db
from backend.app.ml.candidate_retrieval.tfidf_matcher import tfidf_matcher
from backend.app.ml.ranking.ranker import candidate_ranker

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "POSTALIQ Postal Identification Engine",
        "version": "1.0.0"
    }

@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "ready" if db_status == "connected" else "degraded",
        "database": db_status,
        "tfidf_indexer_fitted": tfidf_matcher.is_fitted,
        "ranking_engine": candidate_ranker.model_version_tag,
        "indexed_documents": len(tfidf_matcher.doc_ids) if tfidf_matcher.is_fitted else 0
    }
