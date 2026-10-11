from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    predict, pin, post_offices, search, batch, history, feedback, admin, health
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(predict.router, tags=["Prediction"])
api_router.include_router(pin.router, tags=["PIN Lookup"])
api_router.include_router(post_offices.router, tags=["Post Offices"])
api_router.include_router(search.router, tags=["Search & Discovery"])
api_router.include_router(batch.router, tags=["Bulk Validation"])
api_router.include_router(history.router, tags=["Search History"])
api_router.include_router(feedback.router, tags=["Feedback"])
api_router.include_router(admin.router, tags=["Administration"])
