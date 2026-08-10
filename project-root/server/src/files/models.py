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
    file_hash: Optional[str] = None
    is_duplicate: Optional[bool] = None
    duplicate_of: Optional[int] = None
    similarity_score: Optional[float] = None
    duplicate: Optional[bool] = None
    type: Optional[str] = None
    version: int
    owner_id: int
    folder_id: Optional[int]
    download_count: int
    last_downloaded_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class FileListResponse(BaseModel):
    files: list[FileOut]
    total: int
