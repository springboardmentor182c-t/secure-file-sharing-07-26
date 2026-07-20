"""
File entity.

NOTE: this table is owned by the File Upload teammate's module. Extended
here to include fields required by the Recent module (category, mime_type,
is_deleted, etc.) per project integration needs.
"""
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID


class File(Base):
    __tablename__ = "files"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), nullable=False)
    folder_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), nullable=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("file_categories.id"), nullable=True)

    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    original_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_extension: Mapped[str | None] = mapped_column(String(20), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    encrypted_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    checksum: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_size: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    content_type: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="files")
    category = relationship("FileCategory", lazy="joined")
    shared_links = relationship("SharedLink", back_populates="file", cascade="all, delete-orphan")