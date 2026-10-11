from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "POSTALIQ"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment
    ENV: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "postaliq-dev-secret-key-super-secure-change-in-production-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Database
    # Defaults to SQLite local file, override with postgresql://user:pass@localhost:5432/postaliq
    DATABASE_URL: str = "sqlite:///./postaliq.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Dataset & ML Model Artifacts
    DATASET_PATH: str = "./data/india_post_master.csv"
    MODEL_ARTIFACTS_DIR: str = "./backend/artifacts"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 120
    
    # Confidence Thresholds
    CONFIDENCE_HIGH_THRESHOLD: float = 0.85
    CONFIDENCE_MEDIUM_THRESHOLD: float = 0.70
    CONFIDENCE_MIN_THRESHOLD: float = 0.30
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
