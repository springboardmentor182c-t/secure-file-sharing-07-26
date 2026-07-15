from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = ""
    avatar: Optional[str] = "default"
    theme: Optional[str] = "dark"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    password: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    theme: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = ""
    avatar: Optional[str] = "default"
    theme: Optional[str] = "dark"
    is_active: bool

    class Config:
        from_attributes = True
        # backward compatibility for pydantic v1
        orm_mode = True
