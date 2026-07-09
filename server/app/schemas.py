from pydantic import BaseModel, EmailStr, Field


# ── Auth ────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    mfa_required: bool = False
    mfa_token: str | None = None  # short-lived token identifying the pending login


class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    is_email_verified: bool
    mfa_enabled: bool

    class Config:
        from_attributes = True


# ── MFA ──────────────────────────────────────────────────────────────────
class MFASetupResponse(BaseModel):
    secret: str
    otpauth_url: str
    qr_code_base64: str


class MFAEnableRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class MFAEnableResponse(BaseModel):
    backup_codes: list[str]


class MFAVerifyRequest(BaseModel):
    mfa_token: str
    code: str = Field(min_length=6, max_length=8)  # allow longer backup codes


class MFADisableRequest(BaseModel):
    password: str


# ── Password recovery ───────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# ── Sessions ─────────────────────────────────────────────────────────────
class SessionOut(BaseModel):
    id: str
    user_agent: str | None
    ip_address: str | None
    created_at: str
    last_used_at: str
    is_current: bool = False

    class Config:
        from_attributes = True
