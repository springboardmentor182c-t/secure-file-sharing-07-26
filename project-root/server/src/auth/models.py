from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    organization: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    plan: str
    mfa_enabled: bool
    storage_used: int
    storage_quota: int
    avatar_color: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserOut] = None
    mfa_required: bool = False
    mfa_token: Optional[str] = None


class MeResponse(BaseModel):
    user: UserOut


class VerifyOTPRequest(BaseModel):
    mfa_token: str
    code: str


class ResendOTPRequest(BaseModel):
    mfa_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str