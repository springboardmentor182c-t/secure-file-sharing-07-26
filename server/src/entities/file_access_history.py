import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.core import Base


class FileAccessHistory(Base):
    __tablename__ = "file_access_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    access_type = Column(String(30), nullable=True)
    accessed_at = Column(DateTime, server_default=func.now())
    ip_address = Column(String(45), nullable=True)

    file = relationship("File", lazy="joined")