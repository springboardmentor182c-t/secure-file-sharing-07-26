from sqlalchemy import Column, Integer, String, Boolean, DateTime, BigInteger
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="Viewer")   # Admin, Editor, Viewer
    mfa_enabled = Column(Boolean, default=False)
    status = Column(String, default="Active")  # Active, Inactive
    storage_used_mb = Column(BigInteger, default=0)
    files_count = Column(Integer, default=0)
    last_login = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    hashed_password = Column(String, nullable=True)