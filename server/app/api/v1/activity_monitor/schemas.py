from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_name: str
    action: str
    resource: str | None
    ip_address: str
    status: str
    details: str | None

    model_config = {
        "from_attributes": True
    }


class LoginHistoryResponse(BaseModel):
    id: int
    timestamp: datetime
    user_name: str
    device: str
    browser: str
    location: str
    ip_address: str
    status: str

    model_config = {
        "from_attributes": True
    }


class SecurityEventResponse(BaseModel):
    id: int
    timestamp: datetime
    title: str
    description: str
    severity: str
    source: str | None

    model_config = {
        "from_attributes": True
    }