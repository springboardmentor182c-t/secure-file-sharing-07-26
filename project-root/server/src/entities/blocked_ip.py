from sqlalchemy import Column, String, DateTime, ForeignKey, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class BlockedIP(Base):
    """An IP an admin has blocked from the Access Monitoring screen."""

    __tablename__ = "blocked_ips"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    ip_address = Column(String, unique=True, index=True, nullable=False)
    reason = Column(String, nullable=True)
    blocked_by = Column(Uuid, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
