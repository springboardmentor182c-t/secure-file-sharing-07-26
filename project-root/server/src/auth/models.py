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
    role: str = "member"
    plan: str = "free"
    mfa_enabled: bool = False
    storage_used: int = 0
    storage_quota: int = 5368709120
    avatar_color: str = "linear-gradient(135deg,#3b82f6,#8b5cf6)"
    organization: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        if hasattr(obj, "__dict__"):
            defaults = {
                "role": "member",
                "plan": "free",
                "mfa_enabled": False,
                "storage_used": 0,
                "storage_quota": 5368709120,
                "avatar_color": "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            }
            for attr, def_val in defaults.items():
                if getattr(obj, attr, None) is None:
                    setattr(obj, attr, def_val)
        return super().model_validate(obj, *args, **kwargs)


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

class VerifyMFASetupRequest(BaseModel):
    code: str

class DisableMFARequest(BaseModel):
    password: str