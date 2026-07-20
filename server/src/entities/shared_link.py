"""
SharedLink entity — the core table of the Shared Links module.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID
from src.shared_links.constants import LinkPermission, LinkStatus


class SharedLink(Base):
    __tablename__ = "shared_links"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)

    owner_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), nullable=False)
    file_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("files.id"), nullable=False)

    permission: Mapped[LinkPermission] = mapped_column(
        Enum(LinkPermission, native_enum=False, length=20, values_callable=lambda enum_cls: [e.value for e in enum_cls]), default=LinkPermission.VIEW, nullable=False
    )
    status: Mapped[LinkStatus] = mapped_column(
        Enum(LinkStatus, native_enum=False, length=20, values_callable=lambda enum_cls: [e.value for e in enum_cls]), default=LinkStatus.ACTIVE, nullable=False
    )

    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    password_protected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_download: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    recipient_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    views: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    downloads: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    expiry_warning_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expired_notice_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner = relationship("User")
    file = relationship("File")
    access_logs = relationship("AccessLog", back_populates="shared_link", cascade="all, delete-orphan")
