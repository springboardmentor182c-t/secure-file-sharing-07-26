from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FileResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    mime_type: str
    sha256_hash: str
    stored_name: str
    category: str
    upload_date: str

    class Config:
        from_attributes = True

class DuplicateLogResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    sha256_hash: str
    duplicate_type: str
    similarity_score: float
    target_file_id: Optional[int] = None
    target_file_name: Optional[str] = None
    timestamp: str

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_files: int
    blocked_duplicates: int
    storage_saved_bytes: int
    storage_used_bytes: int

class UploadSuccessResponse(BaseModel):
    status: str  # "success"
    message: str
    file: FileResponse

class UploadDuplicateResponse(BaseModel):
    status: str  # "duplicate"
    duplicate_type: str  # "exact" or "near"
    similarity: float  # 1.0 for exact, or 0.0-1.0 similarity for near
    message: str
    existing_file: FileResponse
