from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

# ==========================================
# RESPONSE MODELS (What Frontend Receives)
# ==========================================
class UserProfileResponse(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    phone_number: Optional[str] = None
    role: Optional[str] = None           # READ-ONLY from UI
    department: Optional[str] = None     # READ-ONLY from UI
    location: Optional[str] = None
    status: Optional[str] = None
    join_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserSettingsResponse(BaseModel):
    timezone: Optional[str] = "UTC+00:00"
    language: Optional[str] = "en-US"
    show_file_previews: bool = False
    email_notifications: bool = True
    in_app_notifications: bool = True

# ==========================================
# REQUEST MODELS (What Frontend Can Update)
# ==========================================
class UpdatePersonalInfoRequest(BaseModel):
    # Notice: 'role' and 'department' are intentionally missing for security
    full_name: str
    phone_number: Optional[str] = None
    location: Optional[str] = None

class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class UpdatePreferencesRequest(BaseModel):
    # UI/General Settings
    timezone: Optional[str] = None
    language: Optional[str] = None
    show_file_previews: bool = False
    # Notification Settings
    email_notifications: bool = True
    in_app_notifications: bool = True
