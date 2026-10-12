from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from backend.app.database.session import Base

class UserLoginHistory(Base):
    __tablename__ = "user_login_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username_or_email = Column(String(150), nullable=False, index=True)
    role = Column(String(50), default="user", nullable=False)  # user, guest, superadmin, admin
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    status = Column(String(30), default="success", nullable=False)  # success, failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
