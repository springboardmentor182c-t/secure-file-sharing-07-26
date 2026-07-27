import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FileOut(BaseModel):
    """Serialized file record returned by the API."""
    id: uuid.UUID
    original_name: str
    mimetype: str
    size: int
    encrypted: bool
    hash_sha256: Optional[str]
    version: int
    owner_id: uuid.UUID
    folder_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class FileListResponse(BaseModel):
    """Paginated / filtered list of files."""
    files: list[FileOut]
    total: int


class FileRenameRequest(BaseModel):
    """Payload for renaming a file."""
    new_name: str = Field(..., min_length=1, max_length=512, description="New display name for the file")
