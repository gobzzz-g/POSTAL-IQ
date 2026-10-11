from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.logging import setup_logging, logger
from backend.app.api.v1.router import api_router
from backend.scripts.import_dataset import init_db_and_import
from backend.app.ml.ranking.ranker import candidate_ranker

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    setup_logging()
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        init_db_and_import()
        # Reload ranker if artifact exists
        candidate_ranker._load_model_if_available()
        logger.info(f"Active ranking engine: {candidate_ranker.model_version_tag}")
    except Exception as e:
        logger.error(f"Error during startup data initialization: {e}")
    yield
    logger.info("Shutting down POSTALIQ...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Indian PIN Code & Post Office Identification Platform API",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite dev and configured origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred while processing postal intelligence request."}
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Every address understood. Every postal match explained.",
        "version": settings.VERSION,
        "documentation": "/docs",
        "api_prefix": settings.API_V1_PREFIX
    }
