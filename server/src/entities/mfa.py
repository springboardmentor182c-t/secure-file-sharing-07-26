import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    String,
    func
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.database.core import Base


class MFACode(Base):
    __tablename__ = "mfa_codes"

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

    otp_code = Column(
        String(10),
        nullable=False
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    verified = Column(
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
        back_populates="mfa_codes"
    )