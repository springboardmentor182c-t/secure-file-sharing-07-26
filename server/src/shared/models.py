from datetime import datetime
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel


class SharedLinkResponse(BaseModel):
    id: Union[UUID, int, str]
    file_name: str
    file_size: Union[int, str]
    mime_type: Optional[str] = None
    created_at: Union[datetime, str]
    expires_at: Optional[Union[datetime, str]] = None
    is_active: bool = True
    download_count: int = 0
    user_id: Optional[Union[UUID, int, str]] = None
    username: Optional[str] = None

    class Config:
        from_attributes = True


class FileShareCreateSchema(BaseModel):
    file_name: str
    size: Optional[str] = "4.2 MB"
    file_type: Optional[str] = "pdf"
    recipient_email: str
    permission: Optional[str] = "viewer"
    owner_name: Optional[str] = "Admin User"


class SharedFilesDashboardDataSchema(BaseModel):
    shares: List[Any]
    stats: List[Any]
    activity: List[Any]
