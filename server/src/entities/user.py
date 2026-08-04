import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from src.database.core import Base

class User(Base):
    """
    User model matching schema.sql users table structure.
    This model is for the main authentication system.
    """
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="SET NULL"),
        nullable=True
    )

    username = Column(
        String(50),
        unique=True,
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    account_status = Column(
        String(20),
        default="ACTIVE"
    )

    email_verified = Column(
        Boolean,
        default=False
    )

    last_login = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now()
    )