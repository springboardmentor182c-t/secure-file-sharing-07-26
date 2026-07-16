from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MFAChallengeResponse(BaseModel):
    mfa_required: bool = True
    mfa_token: str


class MFAVerifyRequest(BaseModel):
    mfa_token: str
    code: str


class MFASetupResponse(BaseModel):
    secret: str
    otpauth_uri: str


class MFAEnableRequest(BaseModel):
    code: str


class MFADisableRequest(BaseModel):
    code: str


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
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class MeResponse(BaseModel):
    user: UserOut
