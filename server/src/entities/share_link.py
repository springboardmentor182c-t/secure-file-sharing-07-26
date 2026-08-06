from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    file_id = Column(Uuid, ForeignKey("files.id"), nullable=False)
    owner_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=True)   # None = public link
    expires_at = Column(DateTime(timezone=True), nullable=True)
    permission = Column(String, default="view", nullable=False)
    recipient_email = Column(String, nullable=True)
    access_count = Column(Integer, default=0)
    max_access = Column(Integer, nullable=True)     # None = unlimited
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
