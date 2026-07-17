from sqlalchemy import Column, String, Boolean, DateTime, BigInteger, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="member")          # admin | member | guest
    plan = Column(String, default="free")            # free | team | enterprise
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String, nullable=True)
    storage_used = Column(BigInteger, default=0)     # bytes
    storage_quota = Column(BigInteger, default=5368709120)  # 5 GB default
    avatar_color = Column(String, default="linear-gradient(135deg,#3b82f6,#8b5cf6)")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
