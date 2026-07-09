from sqlalchemy import (
    Column,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database.core import Base


class Trash(Base):
    __tablename__ = "trash"

    id = Column(UUID(as_uuid=True), primary_key=True)

    file_id = Column(
        UUID(as_uuid=True),
        ForeignKey("files.id"),
        nullable=False,
    )

    deleted_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    is_restored = Column(Boolean, default=False)

    deleted_at = Column(
        DateTime,
        server_default=func.now(),
    )