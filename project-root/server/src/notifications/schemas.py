from pydantic import BaseModel
from typing import Optional

class NotificationSchema(BaseModel):
    """Pydantic schema for notification API payload validation."""
    id: Optional[str] = None
    title: str
    message: str
    read: bool = False