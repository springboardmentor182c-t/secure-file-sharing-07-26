from typing import Optional
from sqlalchemy import Boolean, Integer, String,Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base


class User(Base):
    """User entity matching PostgreSQL `users` table schema."""

    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[Optional[str]] = mapped_column("name", String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="Admin")
    storage: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="0 GB")
    files_count: Mapped[Optional[int]] = mapped_column("files", Integer, nullable=True, default=0)
    last_login: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="active")

    # --- Auth module columns ---
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mfa: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=False)  # mfa ENABLED flag
    mfa_secret: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # base32 TOTP secret
    mfa_recovery_codes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of hashed codes
    oauth_provider: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # "google" | "microsoft"
    oauth_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    files = relationship("File", back_populates="owner", primaryjoin="User.id == File.owner_id", foreign_keys="File.owner_id")
    folders = relationship("Folder", back_populates="owner", primaryjoin="User.id == Folder.owner_id", foreign_keys="Folder.owner_id")
    shared_links = relationship("SharedLink", back_populates="owner", primaryjoin="User.id == SharedLink.owner_id", foreign_keys="SharedLink.owner_id")
