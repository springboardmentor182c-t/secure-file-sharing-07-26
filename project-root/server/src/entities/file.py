from sqlalchemy import Column, Integer, String, Boolean, BigInteger, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from src.database.core import Base
import uuid


class File(Base):
    __tablename__ = "files"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    original_name = Column(String, nullable=False)
    stored_name = Column(String, nullable=False, unique=True)   # UUID on disk
    mimetype = Column(String, nullable=False, default="application/octet-stream")
    size = Column(BigInteger, nullable=False, default=0)        # bytes
    encrypted = Column(Boolean, default=True)
    hash_sha256 = Column(String, nullable=True)                 # integrity hash
    version = Column(Integer, default=1)
    owner_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    folder_id = Column(Uuid, ForeignKey("folders.id"), nullable=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
