"""Folder entity - hierarchical folders owned by a user, for the My Files module."""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base


class Folder(Base):
    __tablename__ = "folders"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, default="New Folder")

    created_at: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    updated_at: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    owner = relationship("User", back_populates="folders", foreign_keys=[owner_id], primaryjoin="Folder.owner_id == User.id")
    parent = relationship("Folder", remote_side=[id], back_populates="children", foreign_keys=[parent_id], primaryjoin="Folder.parent_id == Folder.id")
    children = relationship("Folder", back_populates="parent", foreign_keys=[parent_id], primaryjoin="Folder.id == Folder.parent_id")
