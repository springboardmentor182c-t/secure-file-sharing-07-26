from sqlalchemy import (
    Column,
    String,
    Boolean,
    BigInteger,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database.core import Base


class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True)

    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id"))

    category_id = Column(UUID(as_uuid=True), ForeignKey("file_categories.id"))

    file_name = Column(String(255), nullable=False)

    original_name = Column(String(255), nullable=False)

    file_extension = Column(String(20))

    mime_type = Column(String(100))

    file_size = Column(BigInteger, nullable=False)

    storage_path = Column(String)

    encrypted_path = Column(String)

    description = Column(String)

    is_deleted = Column(Boolean, default=False)

    uploaded_at = Column(DateTime, server_default=func.now())

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )