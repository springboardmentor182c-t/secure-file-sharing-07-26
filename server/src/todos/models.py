import uuid

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    BigInteger,
    Integer,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database.core import Base
from src.users.models import User

# =====================================================
# FOLDERS
# Maps to the existing "folders" table in PostgreSQL
# =====================================================

class Folder(Base):
    __tablename__ = "folders"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    parent_folder_id = Column(
        UUID(as_uuid=True),
        ForeignKey("folders.id", ondelete="CASCADE"),
        nullable=True
    )

    folder_name = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    is_deleted = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now()
    )


# =====================================================
# FILE CATEGORIES
# Maps to the existing "file_categories" table
# =====================================================

class FileCategory(Base):
    __tablename__ = "file_categories"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    category_name = Column(
        String(100),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

# =====================================================
# FILES
# Maps to the existing "files" table in PostgreSQL
# =====================================================

class File(Base):
    __tablename__ = "files"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    folder_id = Column(
        UUID(as_uuid=True),
        ForeignKey("folders.id", ondelete="SET NULL"),
        nullable=True
    )

    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("file_categories.id", ondelete="SET NULL"),
        nullable=True
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    original_name = Column(
        String(255),
        nullable=False
    )

    file_extension = Column(
        String(20),
        nullable=True
    )

    mime_type = Column(
        String(100),
        nullable=True
    )

    file_size = Column(
        BigInteger,
        nullable=False
    )

    storage_path = Column(
        Text,
        nullable=False
    )

    encrypted_path = Column(
        Text,
        nullable=True
    )

    checksum = Column(
        String(255),
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    is_deleted = Column(
        Boolean,
        default=False
    )

    uploaded_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now()
    )

# =====================================================
# FILE VERSIONS
# Maps to existing "file_versions" PostgreSQL table
# =====================================================

class FileVersion(Base):
    __tablename__ = "file_versions"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    file_id = Column(
        UUID(as_uuid=True),
        ForeignKey("files.id", ondelete="CASCADE"),
        nullable=False
    )

    version_number = Column(
        Integer,
        nullable=False
    )

    storage_path = Column(
        Text,
        nullable=False
    )

    encrypted_path = Column(
        Text,
        nullable=True
    )

    checksum = Column(
        String(255),
        nullable=True
    )

    uploaded_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    uploaded_at = Column(
        DateTime,
        server_default=func.now()
    )