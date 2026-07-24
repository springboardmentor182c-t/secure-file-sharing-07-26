"""Pydantic request/response schemas for the Files module (My Files screen)."""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.files.constants import FileCategory


class FileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    folder_id: Optional[uuid.UUID]
    original_filename: str
    extension: str
    mime_type: str
    size: int
    checksum: str
    storage_provider: str
    encryption_status: str
    category: str
    is_starred: bool
    is_deleted: bool
    deleted_at: Optional[datetime]
    download_count: int
    created_at: datetime
    updated_at: datetime
    # Not a plain column - computed by the service layer per request
    # (True if the file has at least one non-revoked shared link).
    is_shared: bool = False


class FileRenameRequest(BaseModel):
    name: str = Field(min_length=1, max_length=500)


class FileMoveRequest(BaseModel):
    folder_id: Optional[uuid.UUID] = None


class FileCategoryUpdateRequest(BaseModel):
    category: FileCategory


class FolderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    parent_id: Optional[uuid.UUID] = None

    @field_validator("name")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Folder name cannot be blank")
        return v


class FolderRename(BaseModel):
    name: str = Field(min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Folder name cannot be blank")
        return v


class FolderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    name: str
    created_at: datetime
    updated_at: datetime
    file_count: int = 0


class StorageStatsRead(BaseModel):
    used_bytes: int
    total_bytes: int
    remaining_bytes: int
    used_percent: float
    file_count: int
    folder_count: int
