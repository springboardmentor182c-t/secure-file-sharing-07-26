import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from src.database.core import Base


class Activity(Base):
    """
    Activity model matching schema.sql activity_logs table structure.
    """
    __tablename__ = "activity_logs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    file_id = Column(
        UUID(as_uuid=True),
        ForeignKey("files.id", ondelete="SET NULL"),
        nullable=True
    )

    action = Column(
        String(100),
        nullable=False
    )

    module = Column(
        String(50),
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    ip_address = Column(
        String(45),
        nullable=True
    )

    device_info = Column(
        Text,
        nullable=True
    )

    resource = Column(
        String(255),
        nullable=True
    )

    status = Column(
        String(30),
        nullable=False,
        default="success"
    )

    details = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )