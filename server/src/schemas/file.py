from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class FileCreate(BaseModel):
    file_name: str
    file_size: int
    file_type: str
    uploaded_by: str
    uploaded_at: str

class FileResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    folder_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None
    file_name: str
    original_name: str
    file_extension: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: int
    storage_path: str
    encrypted_path: Optional[str] = None
    checksum: Optional[str] = None
    description: Optional[str] = None
    is_deleted: bool = False
    uploaded_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FileUpdate(BaseModel):
    file_name: Optional[str] = None
    original_name: Optional[str] = None
    file_extension: Optional[str] = None
    mime_type: Optional[str] = None
    description: Optional[str] = None
    folder_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None