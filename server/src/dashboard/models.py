from pydantic import BaseModel, EmailStr

from typing import Optional


class InviteUserRequest(BaseModel):
    name: str
    email: EmailStr
    role: str = "Viewer"
    
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    mfa_enabled: bool
    status: str
    storage_used_gb: float
    files_count: int

    class Config:
        from_attributes = True


class StorageByUser(BaseModel):
    name: str
    storage_used_gb: float

    class Config:
        from_attributes = True


class SystemServiceOut(BaseModel):
    service_name: str
    latency_ms: float
    uptime_percent: float
    status: str

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_storage_gb: float
    total_storage_limit_gb: float
    files_this_month: int
    active_share_links: int