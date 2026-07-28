from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    done = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
