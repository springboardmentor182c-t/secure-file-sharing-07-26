"""
Pydantic request/response models.
"""
import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Users ────────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v


class UserOut(UserBase):
    id: str
    is_active: bool
    mfa_enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Auth ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """Returned by /auth/login.

    If the user has MFA enabled, `mfa_required` is true and `mfa_token` must be
    exchanged (together with a TOTP code) at /auth/mfa/verify for a full Token.
    Otherwise `token` is populated immediately.
    """

    mfa_required: bool
    mfa_token: str | None = None
    token: Token | None = None
    user: UserOut | None = None


class MFAVerifyRequest(BaseModel):
    mfa_token: str
    code: str = Field(min_length=6, max_length=6)


class MFASetupResponse(BaseModel):
    secret: str
    otpauth_url: str


class MFAEnableRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    # Only ever populated outside of production, to make local testing possible
    # without a real email provider configured.
    reset_token: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class MessageResponse(BaseModel):
    message: str
