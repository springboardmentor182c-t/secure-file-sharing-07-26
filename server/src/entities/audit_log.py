from sqlalchemy import Column, String, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)            # LOGIN | UPLOAD | DOWNLOAD | SHARE | DELETE | etc.
    resource_type = Column(String, nullable=True)      # file | folder | share_link | user
    resource_id = Column(String, nullable=True)
    resource_name = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    level = Column(String, default="info")             # info | warn | error | success
    created_at = Column(DateTime(timezone=True), server_default=func.now())
