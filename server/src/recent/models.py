from datetime import datetime
from uuid import UUID
from typing import Optional, Union
from pydantic import BaseModel


class RecentFileResponse(BaseModel):
    id: Union[UUID, int, str]
    file_name: str
    file_size: Union[int, str]
    mime_type: Optional[str] = None
    category_name: Optional[str] = None
    access_type: Optional[str] = None
    accessed_at: Union[datetime, str]
    user_id: Optional[Union[UUID, int, str]] = None
    username: Optional[str] = None

    class Config:
        from_attributes = True
