"""
DuplicateLog entity - stores logs of prevented exact and near duplicate file uploads.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column

from src.entities.base import Base
from src.entities.guid import GUID


class DuplicateLog(Base):
    __tablename__ = "duplicate_logs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    sha256_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    duplicate_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'exact' or 'near'
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    target_file_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_file_name: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
