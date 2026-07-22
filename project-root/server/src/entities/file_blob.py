"""Persistent encrypted file payloads stored in the application database."""

from sqlalchemy import Column, ForeignKey, Integer, LargeBinary, String

from src.database.core import Base


class FileBlob(Base):
    __tablename__ = "file_blobs"

    file_id = Column(
        Integer,
        ForeignKey("files.id", ondelete="CASCADE"),
        primary_key=True,
    )
    stored_name = Column(String, nullable=False, unique=True, index=True)
    encrypted_data = Column(LargeBinary, nullable=False)
    wrapped_key = Column(LargeBinary, nullable=True)
