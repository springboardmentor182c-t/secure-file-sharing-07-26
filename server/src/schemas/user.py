from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password_hash: str
    role_id: Optional[uuid.UUID] = None
    account_status: str = "ACTIVE"

class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    role_id: Optional[uuid.UUID] = None
    account_status: str
    email_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True