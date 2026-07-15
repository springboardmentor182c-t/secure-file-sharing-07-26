from pydantic import BaseModel
from typing import List

class UserMiniSchema(BaseModel):
    id: int
    name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True

class SharedFileSchema(BaseModel):
    id: int
    name: str
    size: str
    created_at: str
    checksum: str
    security_status: str
    file_type: str
    owner: UserMiniSchema

    class Config:
        from_attributes = True

class FileShareResponseSchema(BaseModel):
    id: int
    permission: str
    shared_at: str
    file: SharedFileSchema
    shared_with: UserMiniSchema

    class Config:
        from_attributes = True

class StatCardSchema(BaseModel):
    label: str
    value: str
    sub: str
    color: str

class ShareActivitySchema(BaseModel):
    day: str
    downloads: int
    shares: int

class SharedFilesDashboardDataSchema(BaseModel):
    shares: List[FileShareResponseSchema]
    stats: List[StatCardSchema]
    activity: List[ShareActivitySchema]

class FileShareCreateSchema(BaseModel):
    file_name: str
    size: str
    file_type: str
    recipient_email: str
    permission: str
    owner_name: str
