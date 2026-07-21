<<<<<<< Updated upstream
import uuid

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
)
=======
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
>>>>>>> Stashed changes
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.entities.base import Base
from src.entities.guid import GUID

<<<<<<< Updated upstream
=======
# Real, configurable default storage quota per user (bytes). Not a
# hardcoded/dummy value baked into API responses - it's a normal system
# configuration constant (like a plan limit), applied once at row-creation
# time and stored as a real per-user column so it can be changed per user
# later (e.g. by an admin/billing feature) without touching this default.
DEFAULT_STORAGE_QUOTA_BYTES = int(os.getenv("DEFAULT_STORAGE_QUOTA_GB", "500")) * 1024 * 1024 * 1024

>>>>>>> Stashed changes

class User(Base):
    __tablename__ = "users"

<<<<<<< Updated upstream
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4
    )

    role_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("roles.id"),
        nullable=True,
    )

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    password_hash: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    account_status: Mapped[str] = mapped_column(
        String(20),
        default="ACTIVE",
    )

    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    last_login: Mapped[DateTime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime,
        server_default=func.now(),
    )

    updated_at: Mapped[DateTime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Shared Links / File relationships
    files = relationship(
        "File",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    # shared_links = relationship(
    #     "SharedLink",
    #     back_populates="owner",
    #     cascade="all, delete-orphan"
    # )
=======
    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_quota_bytes: Mapped[int] = mapped_column(
        BigInteger, nullable=False, default=DEFAULT_STORAGE_QUOTA_BYTES
    )

    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    shared_links = relationship("SharedLink", back_populates="owner", cascade="all, delete-orphan")
>>>>>>> Stashed changes
