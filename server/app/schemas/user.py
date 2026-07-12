from pydantic import BaseModel
from datetime import datetime

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    mfa_enabled: bool
    status: str
    storage_used_mb: int
    files_count: int
    last_login: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: str
    role: str = "Viewer"