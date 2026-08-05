"""
User entity.

This module provides the core user table used by the files and shared-links
features. It includes the storage quota column from the original files module
and the authentication-related columns used by the newer auth/shared-link work.
"""
import os
import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID

# Real, configurable default storage quota per user (bytes).
DEFAULT_STORAGE_QUOTA_BYTES = int(os.getenv("DEFAULT_STORAGE_QUOTA_GB", "500")) * 1024 * 1024 * 1024


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    role_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("roles.id"), nullable=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    storage_quota_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, default=DEFAULT_STORAGE_QUOTA_BYTES)
    account_status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    shared_links = relationship("SharedLink", back_populates="owner", cascade="all, delete-orphan")
