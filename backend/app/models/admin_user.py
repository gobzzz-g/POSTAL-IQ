from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime, timezone
from backend.app.database.session import Base

class DatasetImport(Base):
    __tablename__ = "dataset_imports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    source = Column(String(255), nullable=False)  # e.g., India Post Directory / data.gov.in
    total_rows = Column(Integer, default=0)
    imported_rows = Column(Integer, default=0)
    skipped_rows = Column(Integer, default=0)
    status = Column(String(30), default="in_progress")  # completed, failed, in_progress
    error_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    version_tag = Column(String(50), unique=True, nullable=False)
    model_type = Column(String(50), nullable=False)  # logistic_regression, random_forest, deterministic_fallback
    is_active = Column(Boolean, default=False)
    top1_accuracy = Column(String(20), nullable=True)
    top3_accuracy = Column(String(20), nullable=True)
    macro_f1 = Column(String(20), nullable=True)
    mean_latency_ms = Column(String(20), nullable=True)
    training_sample_count = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(30), default="admin")  # superadmin, admin, auditor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
