from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class TrashFileResponse(BaseModel):
    id: UUID
    owner_id: UUID
    folder_id: Optional[UUID] = None
    category_id: Optional[UUID] = None

    file_name: str
    original_name: str

    file_extension: Optional[str] = None
    mime_type: Optional[str] = None

    file_size: int

    storage_path: str
    encrypted_path: Optional[str] = None

    description: Optional[str] = None

    uploaded_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RestoreResponse(BaseModel):
    message: str


class DeleteResponse(BaseModel):
    message: str