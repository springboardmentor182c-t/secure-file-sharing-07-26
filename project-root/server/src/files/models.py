from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FileOut(BaseModel):
    id: int
    original_name: str
    mimetype: str
    size: int
    encrypted: bool
    hash_sha256: Optional[str]
    version: int
    owner_id: int
    folder_id: Optional[int]
    download_count: int
    last_downloaded_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class FileListResponse(BaseModel):
    files: list[FileOut]
    total: int
