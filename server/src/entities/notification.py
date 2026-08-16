"""
Notification entity — persisted in-app/email notice, e.g. "link expiring
in 24h" or "link expired". Created by the background expiration job.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID
from src.shared_links.constants import NotificationType


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), nullable=False)
    shared_link_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("shared_links.id"), nullable=True
    )

    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, native_enum=False, length=20, values_callable=lambda enum_cls: [e.value for e in enum_cls]), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    shared_link = relationship("SharedLink", back_populates="notifications")
