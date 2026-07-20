from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SharedFileOut(BaseModel):
    permission_id: int
    file_id: int
    name: str
    mimetype: str
    size: int
    encrypted: bool
    permission: str
    shared_by: str
    shared_by_email: str
    shared_at: datetime
    updated_at: Optional[datetime] = None
    can_download: bool


class SharedFilesResponse(BaseModel):
    files: list[SharedFileOut]
    total: int
    view_only: int
    downloadable: int
