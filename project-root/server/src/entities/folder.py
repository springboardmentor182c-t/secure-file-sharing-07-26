from sqlalchemy import Column, String, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    owner_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Uuid, ForeignKey("folders.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
