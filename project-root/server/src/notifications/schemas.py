from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    category: str
    title: str
    message: str
    icon: str
    is_read: bool
    created_at: datetime


class MarkAllReadResponse(BaseModel):
    updated: int
