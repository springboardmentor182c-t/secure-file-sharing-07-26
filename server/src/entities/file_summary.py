import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.entities.base import Base
from src.entities.guid import GUID


class FileSummary(Base):
    __tablename__ = "file_summaries"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    file_id: Mapped[int] = mapped_column(               # was uuid.UUID
        Integer,                                          # was GUID()
        ForeignKey("files.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",  # pending | completed | failed
    )

    model_used: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    file = relationship("File", backref="summary", uselist=False)

    def __repr__(self):
        return f"<FileSummary file_id={self.file_id} status={self.status}>"