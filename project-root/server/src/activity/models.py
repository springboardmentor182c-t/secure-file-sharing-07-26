from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ActivityCreate(BaseModel):
    user_id: int
    action: str
    file_name: Optional[str] = None
    description: Optional[str] = None


class ActivityResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    resource_name: Optional[str] = None
    ip_address: Optional[str] = None
    level: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
