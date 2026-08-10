"""Pydantic request/response schemas for the Files module (My Files screen)."""
import uuid
from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.files.constants import FileCategory


class FileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Union[uuid.UUID, int, str]
    owner_id: Optional[Union[uuid.UUID, int, str]] = None
    folder_id: Optional[Union[uuid.UUID, int, str]] = None
    original_filename: str = "file.pdf"
    extension: str = "pdf"
    mime_type: str = "application/pdf"
    size: Optional[Union[int, str]] = "0 B"
    checksum: Optional[str] = ""
    storage_provider: Optional[str] = "local"
    encryption_status: Optional[str] = "unencrypted"
    category: Optional[str] = "Other"
    is_starred: Optional[bool] = False
    is_deleted: Optional[bool] = False
    deleted_at: Optional[Union[datetime, str]] = None
    download_count: Optional[int] = 0
    created_at: Optional[Union[datetime, str]] = None
    updated_at: Optional[Union[datetime, str]] = None
    is_shared: Optional[bool] = False


class FileRenameRequest(BaseModel):
    name: str = Field(min_length=1, max_length=500)


class FileMoveRequest(BaseModel):
    folder_id: Optional[Union[uuid.UUID, int, str]] = None


class FileCategoryUpdateRequest(BaseModel):
    category: FileCategory


class FolderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    parent_id: Optional[Union[uuid.UUID, int, str]] = None

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

    id: Union[uuid.UUID, int, str]
    owner_id: Optional[Union[uuid.UUID, int, str]] = None
    parent_id: Optional[Union[uuid.UUID, int, str]] = None
    name: str = "Folder"
    created_at: Optional[Union[datetime, str]] = None
    updated_at: Optional[Union[datetime, str]] = None
    file_count: int = 0


class StorageStatsRead(BaseModel):
    used_bytes: int = 0
    total_bytes: int = 10737418240
    remaining_bytes: int = 10737418240
    used_percent: float = 0.0
    file_count: int = 0
    folder_count: int = 0
