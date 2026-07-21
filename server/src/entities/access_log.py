"""
AccessLog entity — one row per access attempt (view/download) against a
shared link, successful or not. Powers analytics + audit history.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID


class AccessLog(Base):
    __tablename__ = "access_logs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    shared_link_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("shared_links.id"), nullable=False
    )

    action: Mapped[str] = mapped_column(String(20), nullable=False)  # "view" | "download"
    success: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)

    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    shared_link = relationship("SharedLink", back_populates="access_logs")
