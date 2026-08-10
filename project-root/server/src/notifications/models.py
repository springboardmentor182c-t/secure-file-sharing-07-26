import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# The categories surfaced as filter chips on the Notifications page.
NotificationType = Literal[
    "share",          # a file/folder was shared with the user
    "download",       # someone downloaded a file the user owns
    "access_denied",  # unauthorized access attempt on the user's resource
    "login",          # sign-in from a new device / location
    "expiry",         # a share link expired or is about to
    "info",           # generic fallback
]


class NotificationOut(BaseModel):
    """Serialized notification returned by the API."""
    id: uuid.UUID
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    """Payload for raising a notification for the authenticated user."""
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    type: NotificationType = "info"


class NotificationSummary(BaseModel):
    """Counts that drive the page header, filter chips and sidebar badge."""
    total: int
    unread: int
    unread_by_type: dict[str, int]


class MarkReadResponse(BaseModel):
    """Number of rows affected by a bulk read / delete operation."""
    updated: int
