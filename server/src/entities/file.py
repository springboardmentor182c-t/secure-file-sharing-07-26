import uuid
from sqlalchemy import Column, String, Text, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database.core import Base


class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    folder_id = Column(UUID(as_uuid=True), nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("file_categories.id", ondelete="SET NULL"), nullable=True)

    file_name = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_extension = Column(String(20), nullable=True)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, nullable=False)
    storage_path = Column(Text, nullable=False)
    encrypted_path = Column(Text, nullable=True)
    checksum = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    is_deleted = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("FileCategory", lazy="joined")