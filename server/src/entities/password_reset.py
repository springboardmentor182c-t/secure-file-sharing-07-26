import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Text,
    func
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.database.core import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    token = Column(
        Text,
        nullable=False
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    is_used = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # ==========================
    # Relationships
    # ==========================

    user = relationship(
        "User",
        back_populates="password_reset_tokens"
    )