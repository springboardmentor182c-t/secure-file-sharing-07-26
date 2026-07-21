import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)

from sqlalchemy.orm import Mapped, mapped_column

from src.entities.base import Base
from src.entities.guid import GUID


class Notification(Base):

    __tablename__ = "notifications"


    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4
    )


    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id"),
        nullable=False
    )


    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )


    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )


    notification_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )


    related_entity: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )


    related_entity_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        nullable=True
    )


    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )