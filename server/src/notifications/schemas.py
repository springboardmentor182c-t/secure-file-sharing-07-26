from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from src.shared_links.constants import NotificationType


class NotificationResponse(BaseModel):

    id: UUID

    type: NotificationType

    title: str

    message: str

    is_read: bool

    email_sent: bool

    shared_link_id: UUID | None

    created_at: datetime


    class Config:
        from_attributes = True