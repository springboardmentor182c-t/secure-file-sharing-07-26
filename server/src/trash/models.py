from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class TrashItemResponse(BaseModel):
    id: UUID
    file_name: str
    file_size: int
    mime_type: Optional[str] = None
    deleted_at: datetime
    user_id: UUID
    username: Optional[str] = None

    class Config:
        from_attributes = True
