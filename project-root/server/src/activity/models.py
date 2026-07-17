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
    user_id: int
    action: str
    file_name: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)