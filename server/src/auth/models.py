"""Pydantic schemas for the auth module."""
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ---------- requests ----------

class SignupRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MfaVerifyRequest(BaseModel):
    mfa_token: str
    code: str = Field(min_length=6, max_length=6)


class MfaRecoveryRequest(BaseModel):
    mfa_token: str
    recovery_code: str


class MfaEnableRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class MfaDisableRequest(BaseModel):
    password: str


# ---------- responses ----------

class UserOut(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    mfa_enabled: bool = False

    class Config:
        from_attributes = True

    @classmethod
    def from_user(cls, user) -> "UserOut":
        return cls(
            id=user.id,
            full_name=user.username,
            email=user.email,
            role=user.role,
            mfa_enabled=bool(user.mfa),
        )


class AuthSuccessData(BaseModel):
    mfa_required: bool = False
    token: Optional[str] = None
    user: Optional[UserOut] = None


class MfaChallengeData(BaseModel):
    mfa_required: bool = True
    mfa_token: str


class MfaSetupData(BaseModel):
    secret: str
    qr_provisioning_uri: str


class MfaEnableData(BaseModel):
    recovery_codes: List[str]