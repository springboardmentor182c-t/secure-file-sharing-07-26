"""
User entity.

NOTE: this table is owned by the Auth/User Management teammate's module.
It's populated here only because it was an empty placeholder file and the
Shared Links module needs *a* users table to attach `owner_id` /
`recipient` foreign keys to. Only the columns Shared Links actually
depends on (`id`, `email`, `full_name`) are defined — the auth owner should
feel free to extend this file with password hashes, roles, etc. without
needing to touch anything under `src/shared_links/`.
"""
import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    shared_links = relationship("SharedLink", back_populates="owner", cascade="all, delete-orphan")

