import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FolderOut(BaseModel):
    id: uuid.UUID
    name: str
    owner_id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    file_count: int = 0
    total_size: int = 0
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class FolderListResponse(BaseModel):
    folders: list[FolderOut]
    total: int


class FolderCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Folder display name")
    parent_id: Optional[uuid.UUID] = Field(None, description="Parent folder ID (omit for root)")


class FolderRenameRequest(BaseModel):
    new_name: str = Field(..., min_length=1, max_length=255, description="New folder name")
