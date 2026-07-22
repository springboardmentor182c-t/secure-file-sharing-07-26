"""
User entity.

NOTE: this table is owned by the Auth/User Management teammate's module
(`src/auth/`, currently an empty placeholder). It's populated here only
because it was an empty placeholder file and both the Shared Links and
Files modules need *a* users table to attach `owner_id` foreign keys to.
Only the columns those two modules actually depend on are defined here -
the auth owner should feel free to extend this file with password hashes,
roles, etc. without needing to touch `src/shared_links/` or `src/files/`.
"""
import os
import uuid

from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID

# Real, configurable default storage quota per user (bytes). Not a
# hardcoded/dummy value baked into API responses - it's a normal system
# configuration constant (like a plan limit), applied once at row-creation
# time and stored as a real per-user column so it can be changed per user
# later (e.g. by an admin/billing feature) without touching this default.
DEFAULT_STORAGE_QUOTA_BYTES = int(os.getenv("DEFAULT_STORAGE_QUOTA_GB", "500")) * 1024 * 1024 * 1024


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_quota_bytes: Mapped[int] = mapped_column(
        BigInteger, nullable=False, default=DEFAULT_STORAGE_QUOTA_BYTES
    )

    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    shared_links = relationship("SharedLink", back_populates="owner", cascade="all, delete-orphan")
