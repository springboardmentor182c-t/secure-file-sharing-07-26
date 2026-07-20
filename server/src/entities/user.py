import uuid

from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.entities.base import Base
from src.entities.guid import GUID


class User(Base):
    __tablename__ = "users"

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