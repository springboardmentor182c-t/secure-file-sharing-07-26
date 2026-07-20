from pydantic import BaseModel
from typing import List

class SecurityEventSchema(BaseModel):
    id: int
    ts: str
    event: str
    source: str
    country: str
    severity: str
    blocked: bool

    class Config:
        from_attributes = True

class EncryptionKeySchema(BaseModel):
    id: str
    file: str
    created: str
    rotated: str
    algorithm: str
    status: str

    class Config:
        from_attributes = True

class StatCardSchema(BaseModel):
    label: str
    value: str
    sub: str
    color: str

class LoginAttemptSchema(BaseModel):
    hour: str
    success: int
    failed: int

class UserProfileSchema(BaseModel):
    name: str
    role: str

class SecurityDashboardDataSchema(BaseModel):
    stats: List[StatCardSchema]
    login_attempts: List[LoginAttemptSchema]
    events: List[SecurityEventSchema]
    keys: List[EncryptionKeySchema]
    current_user: UserProfileSchema

