from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")   # info | success | warning | error | share | upload
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
