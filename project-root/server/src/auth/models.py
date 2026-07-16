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


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    # DEV ONLY: normally the reset link is emailed. With no mail server configured,
    # the token is returned here so the flow is testable locally.
    reset_token: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


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


# ADD THESE BELOW 👇

class MFAChallengeResponse(BaseModel):
    mfa_token: str
    mfa_required: bool = True


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