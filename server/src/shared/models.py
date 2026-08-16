from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SharedLinkResponse(BaseModel):
    id: UUID
    file_name: str
    file_size: int
    mime_type: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool
    download_count: int
    user_id: UUID
    username: Optional[str] = None

    class Config:
        from_attributes = True
