<<<<<<< Updated upstream
import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    String,
    func,
)
=======
"""
File entity - the real My Files module schema (this used to be a
temporary, minimal placeholder table owned by "whoever builds Files
first" - that's this module now).
"""
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, func
>>>>>>> Stashed changes
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID


class File(Base):
    __tablename__ = "files"

<<<<<<< Updated upstream
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    owner_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id"),
        nullable=False,
    )

    folder_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("folders.id"),
        nullable=True,
    )

    category_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("file_categories.id"),
        nullable=True,
    )

    file_name: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    original_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    file_extension: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    mime_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        nullable=False,
    )

    storage_path: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )

    encrypted_path: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    checksum: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner = relationship(
        "User",
        back_populates="files",
    )

    # shared_links = relationship(
    #     "SharedLink",
    #     back_populates="file",
    #     cascade="all, delete-orphan",
    # )
=======
    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    folder_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("folders.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Identity / naming
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    extension: Mapped[str] = mapped_column(String(20), nullable=False, default="")
    mime_type: Mapped[str] = mapped_column(String(255), nullable=False, default="application/octet-stream")

    # Storage (abstracted so this can move to S3/Azure later - see src/files/storage.py)
    storage_provider: Mapped[str] = mapped_column(String(20), nullable=False, default="local")
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    size: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)  # sha256 hex digest

    # Security
    encryption_status: Mapped[str] = mapped_column(String(20), nullable=False, default="unencrypted")

    # Organization
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="Other")
    is_starred: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Lifecycle
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Usage
    download_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="files")
    folder = relationship("Folder", back_populates="files")
    shared_links = relationship("SharedLink", back_populates="file", cascade="all, delete-orphan")

    # --- Backward-compatible read-only aliases -----------------------------
    # The Shared Links module (owned by a different teammate) was written
    # against this entity's original, minimal placeholder columns
    # (`file_name`, `file_type`). Rather than touch every one of its
    # references, these two properties keep that code working unchanged
    # against the real columns above.
    @property
    def file_name(self) -> str:
        return self.original_filename

    @property
    def file_type(self) -> str:
        return self.extension
>>>>>>> Stashed changes
