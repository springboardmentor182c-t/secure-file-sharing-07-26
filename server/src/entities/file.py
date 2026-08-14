"""
File entity - exact mapping matching PostgreSQL `files` table columns.
"""
from typing import Any, Optional
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.entities.base import Base


class File(Base):
    __tablename__ = "files"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[Optional[str]] = mapped_column("name", String(500), nullable=True)
    size: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="0 B")
    owner_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    checksum: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, default="")
    security_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="clean")
    file_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="pdf")

    folder_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Other")
    is_deleted: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=False)
    is_starred: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=False)
    updated_at: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    download_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=0)

    owner = relationship("User", back_populates="files", foreign_keys=[owner_id], primaryjoin="File.owner_id == User.id")
    shared_links = relationship("SharedLink", back_populates="file", cascade="all, delete-orphan")

    @property
    def original_filename(self) -> str:
        return self.name or "file.pdf"

    @property
    def file_name(self) -> str:
        return self.name or "file.pdf"

    @property
    def extension(self) -> str:
        return self.file_type or "pdf"

    @property
    def mime_type(self) -> str:
        ext = (self.file_type or "").lower().strip(".")
        if ext in ["jpg", "jpeg"]:
            return "image/jpeg"
        elif ext in ["png", "webp", "gif", "svg", "bmp", "ico"]:
            return f"image/{ext}"
        elif ext in ["mp4", "webm", "avi", "mov", "mkv"]:
            return f"video/{ext}"
        elif ext in ["mp3", "wav", "ogg", "flac", "m4a"]:
            return f"audio/{ext}"
        elif ext == "pdf":
            return "application/pdf"
        elif ext in ["doc", "docx"]:
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document" if ext == "docx" else "application/msword"
        elif ext in ["xls", "xlsx"]:
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if ext == "xlsx" else "application/vnd.ms-excel"
        elif ext in ["ppt", "pptx"]:
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation" if ext == "pptx" else "application/vnd.ms-powerpoint"
        elif ext in ["zip", "rar", "7z", "tar", "gz"]:
            return f"application/{ext}"
        elif ext == "json":
            return "application/json"
        elif ext in ["txt", "md", "csv", "log"]:
            return "text/plain"
        elif ext in ["html", "css", "js", "ts", "py", "java", "cpp", "c", "sh"]:
            return f"text/{ext}"
        return f"application/{ext or 'octet-stream'}"

    @property
    def encryption_status(self) -> str:
        return "unencrypted"

    @property
    def storage_provider(self) -> str:
        return "local"

    stored_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    owner_uuid: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    @property
    def file_path(self) -> str:
        return self.stored_path or f"uploads/{self.name or 'file'}"
