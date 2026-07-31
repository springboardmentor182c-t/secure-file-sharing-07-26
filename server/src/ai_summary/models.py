"""
Pydantic schemas for the AI File Summary feature.
These define request/response shapes for the controller endpoints.
"""

from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel


class SummaryStatus:
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    NOT_GENERATED = "not_generated"


class GenerateSummaryResponse(BaseModel):
    status: str
    message: Optional[str] = None


class SummaryResponse(BaseModel):
    status: str
    summary: Optional[str] = None
    model_used: Optional[str] = None
    generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FileListItem(BaseModel):
    """
    Used by GET /api/ai-summary/files to list files available for summarization.
    """
    id: uuid.UUID
    file_name: str
    file_extension: Optional[str] = None
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True