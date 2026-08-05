from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RecentFileResponse(BaseModel):
    id: UUID
    file_name: str
    file_size: int
    mime_type: Optional[str] = None
    category_name: Optional[str] = None
    access_type: Optional[str] = None
    accessed_at: datetime
    user_id: UUID
    username: Optional[str] = None

    class Config:
        from_attributes = True
