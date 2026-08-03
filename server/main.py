"""
Authentication module (FastAPI + PostgreSQL)
Endpoints: register, login, MFA setup/enable/disable/verify, forgot/reset
password, current user, logout. Kept to one file on purpose.
"""
import os
import secrets
import urllib.parse
from datetime import datetime, timedelta, timezone

import bcrypt
import httpx
import jwt
import pyotp
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer,
                         String, create_engine)
from sqlalchemy.orm import Session, declarative_base, sessionmaker

APP_NAME = "TrustShare"

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/authdb")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
ACCESS_MIN = int(os.getenv("ACCESS_TOKEN_MINUTES", 30))
REFRESH_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", 7))
MFA_MIN = int(os.getenv("MFA_TOKEN_MINUTES", 5))
EMAIL_OTP_MIN = int(os.getenv("EMAIL_OTP_MINUTES", 10))

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_LINK_REDIRECT_URI = os.getenv("GOOGLE_LINK_REDIRECT_URI", "http://localhost:5173/oauth/google/callback")
GOOGLE_LOGIN_REDIRECT_URI = os.getenv("GOOGLE_LOGIN_REDIRECT_URI", "http://localhost:5173/oauth/google/login-callback")

MICROSOFT_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID")
MICROSOFT_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET")
MICROSOFT_LINK_REDIRECT_URI = os.getenv("MICROSOFT_LINK_REDIRECT_URI", "http://localhost:5173/oauth/microsoft/callback")
MICROSOFT_LOGIN_REDIRECT_URI = os.getenv("MICROSOFT_LOGIN_REDIRECT_URI", "http://localhost:5173/oauth/microsoft/login-callback")

# Generalized OAuth provider registry — add a new provider by adding an entry here.
OAUTH_PROVIDERS = {
    "google": {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://openidconnect.googleapis.com/v1/userinfo",
        "scope": "openid email",
        "extra_authorize_params": {"prompt": "consent"},
        "link_redirect_uri": GOOGLE_LINK_REDIRECT_URI,
        "login_redirect_uri": GOOGLE_LOGIN_REDIRECT_URI,
    },
    "microsoft": {
        "client_id": MICROSOFT_CLIENT_ID,
        "client_secret": MICROSOFT_CLIENT_SECRET,
        "authorize_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "userinfo_url": "https://graph.microsoft.com/oidc/userinfo",
        "scope": "openid email profile",
        "extra_authorize_params": {},
        "link_redirect_uri": MICROSOFT_LINK_REDIRECT_URI,
        "login_redirect_uri": MICROSOFT_LOGIN_REDIRECT_URI,
    },
}


def get_oauth_provider(provider: str) -> dict:
    cfg = OAUTH_PROVIDERS.get(provider)
    if not cfg:
        raise HTTPException(404, f"Unknown OAuth provider '{provider}'")
    return cfg


def oauth_is_configured(provider: str) -> bool:
    cfg = OAUTH_PROVIDERS.get(provider)
    return bool(cfg and cfg["client_id"] and cfg["client_secret"])

# ── Database ──────────────────────────────────────────────────────────────
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(64))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(128), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)


class RecoveryCode(Base):
    __tablename__ = "recovery_codes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code_hash = Column(String(255), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class EmailOtpCode(Base):
    __tablename__ = "email_otp_codes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(32), nullable=False)
    provider_account_id = Column(String(255), nullable=False)
    provider_email = Column(String(255))
    connected_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Security helpers ──────────────────────────────────────────────────────
bearer = HTTPBearer()


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(p: str, hashed: str) -> bool:
    return bcrypt.checkpw(p.encode("utf-8")[:72], hashed.encode("utf-8"))


def _make_token(sub: int, token_type: str, minutes=None, days=None) -> str:
    delta = timedelta(minutes=minutes) if minutes else timedelta(days=days)
    payload = {"sub": str(sub), "type": token_type, "exp": datetime.now(timezone.utc) + delta}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def create_access_token(uid: int) -> str:
    return _make_token(uid, "access", minutes=ACCESS_MIN)


def create_refresh_token(uid: int) -> str:
    return _make_token(uid, "refresh", days=REFRESH_DAYS)


def create_mfa_token(uid: int) -> str:
    return _make_token(uid, "mfa_pending", minutes=MFA_MIN)


def create_oauth_state_token(uid: int) -> str:
    return _make_token(uid, "oauth_state", minutes=10)


def create_oauth_login_state_token() -> str:
    # No user id yet — this flow is used for signing in / signing up via OAuth.
    return _make_token(0, "oauth_login_state", minutes=10)


def decode_token(token: str, expected_type: str):
    try:
        claims = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    if claims.get("type") != expected_type:
        return None
    return claims


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    claims = decode_token(creds.credentials, "access")
    if not claims:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.query(User).filter(User.id == int(claims["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user


# ── Schemas ───────────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    mfa_enabled: bool

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str


class LoginOut(BaseModel):
    mfa_required: bool
    mfa_token: str | None = None
    token: TokenOut | None = None
    user: UserOut | None = None


class MFAVerifyIn(BaseModel):
    mfa_token: str
    code: str


class MFAEnableIn(BaseModel):
    code: str


class EmailOtpRequestIn(BaseModel):
    mfa_token: str


class EmailOtpRequestOut(BaseModel):
    message: str
    dev_code: str | None = None  # returned only outside production, for local testing (no email server configured)


class MFASetupOut(BaseModel):
    secret: str
    otpauth_url: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ForgotPasswordOut(BaseModel):
    message: str
    reset_token: str | None = None  # returned only outside production, for local testing


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class MessageOut(BaseModel):
    message: str


class RecoveryCodesOut(BaseModel):
    codes: list[str]


class RecoveryCodesStatusOut(BaseModel):
    total: int
    remaining: int


class OAuthConnectionOut(BaseModel):
    provider: str
    email: str | None = None
    connected_at: datetime


class OAuthConnectionsOut(BaseModel):
    connections: list[OAuthConnectionOut]
    providers_configured: dict[str, bool]


class OAuthStartOut(BaseModel):
    authorize_url: str


class OAuthCallbackIn(BaseModel):
    code: str
    state: str


# ── App ───────────────────────────────────────────────────────────────────
app = FastAPI(title=APP_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=UserOut, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "Email already registered")
    user = User(email=payload.email, full_name=payload.full_name, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login", response_model=LoginOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password")
    if not user.is_active:
        raise HTTPException(403, "Account is deactivated")

    if user.mfa_enabled:
        return LoginOut(mfa_required=True, mfa_token=create_mfa_token(user.id))

    return LoginOut(
        mfa_required=False,
        token=TokenOut(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id)),
        user=UserOut.model_validate(user),
    )


@app.post("/auth/mfa/verify", response_model=LoginOut)
def mfa_verify(payload: MFAVerifyIn, db: Session = Depends(get_db)):
    claims = decode_token(payload.mfa_token, "mfa_pending")
    if not claims:
        raise HTTPException(401, "MFA session expired, please sign in again")
    user = db.query(User).filter(User.id == int(claims["sub"])).first()
    if not user or not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(400, "MFA is not enabled for this account")

    totp_ok = pyotp.TOTP(user.mfa_secret).verify(payload.code, valid_window=1)
    recovery_ok = False
    matched_recovery_row = None
    email_otp_ok = False
    matched_email_otp_row = None

    if not totp_ok:
        now = datetime.now(timezone.utc)
        for row in db.query(EmailOtpCode).filter(
            EmailOtpCode.user_id == user.id, EmailOtpCode.used.is_(False), EmailOtpCode.expires_at > now
        ):
            if bcrypt.checkpw(payload.code.encode("utf-8"), row.code_hash.encode("utf-8")):
                email_otp_ok = True
                matched_email_otp_row = row
                break

    if not totp_ok and not email_otp_ok:
        for row in db.query(RecoveryCode).filter(
            RecoveryCode.user_id == user.id, RecoveryCode.used.is_(False)
        ):
            if bcrypt.checkpw(payload.code.encode("utf-8"), row.code_hash.encode("utf-8")):
                recovery_ok = True
                matched_recovery_row = row
                break

    if not totp_ok and not email_otp_ok and not recovery_ok:
        raise HTTPException(401, "Invalid authentication code")

    if matched_recovery_row:
        matched_recovery_row.used = True
        db.commit()
    if matched_email_otp_row:
        matched_email_otp_row.used = True
        db.commit()

    return LoginOut(
        mfa_required=False,
        token=TokenOut(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id)),
        user=UserOut.model_validate(user),
    )


@app.post("/auth/mfa/email-otp/request", response_model=EmailOtpRequestOut)
def request_email_otp(payload: EmailOtpRequestIn, db: Session = Depends(get_db)):
    claims = decode_token(payload.mfa_token, "mfa_pending")
    if not claims:
        raise HTTPException(401, "MFA session expired, please sign in again")
    user = db.query(User).filter(User.id == int(claims["sub"])).first()
    if not user or not user.mfa_enabled:
        raise HTTPException(400, "MFA is not enabled for this account")

    # Invalidate any previous unused codes so only the latest one is valid.
    db.query(EmailOtpCode).filter(EmailOtpCode.user_id == user.id, EmailOtpCode.used.is_(False)).delete()

    code = f"{secrets.randbelow(1_000_000):06d}"
    db.add(EmailOtpCode(
        user_id=user.id,
        code_hash=bcrypt.hashpw(code.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=EMAIL_OTP_MIN),
    ))
    db.commit()

    # No email server is configured in this project, so the code is returned
    # directly for local testing instead of being sent — see README.
    return EmailOtpRequestOut(message=f"A code was sent to {user.email}", dev_code=code)


@app.post("/auth/mfa/setup", response_model=MFASetupOut)
def mfa_setup(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = pyotp.random_base32()
    user.mfa_secret = secret
    user.mfa_enabled = False  # stays off until confirmed via /mfa/enable
    db.commit()
    uri = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=APP_NAME)
    return MFASetupOut(secret=secret, otpauth_url=uri)


@app.post("/auth/mfa/enable", response_model=MessageOut)
def mfa_enable(payload: MFAEnableIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.mfa_secret:
        raise HTTPException(400, "Call /auth/mfa/setup first")
    if not pyotp.TOTP(user.mfa_secret).verify(payload.code, valid_window=1):
        raise HTTPException(401, "Invalid authentication code")
    user.mfa_enabled = True
    db.commit()
    return MessageOut(message="MFA has been enabled for your account")


@app.post("/auth/mfa/disable", response_model=MessageOut)
def mfa_disable(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.mfa_enabled = False
    user.mfa_secret = None
    db.query(RecoveryCode).filter(RecoveryCode.user_id == user.id).delete()
    db.commit()
    return MessageOut(message="MFA has been disabled for your account")


@app.post("/auth/recovery-codes/generate", response_model=RecoveryCodesOut)
def generate_recovery_codes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.mfa_enabled:
        raise HTTPException(400, "Enable MFA before generating recovery codes")

    # Regenerating replaces any previous batch outright.
    db.query(RecoveryCode).filter(RecoveryCode.user_id == user.id).delete()

    plaintext_codes = []
    for _ in range(10):
        code = "-".join(secrets.token_hex(2) for _ in range(2))  # e.g. "a1b2-c3d4"
        plaintext_codes.append(code)
        db.add(RecoveryCode(
            user_id=user.id,
            code_hash=bcrypt.hashpw(code.encode("utf-8"), bcrypt.gensalt()).decode("utf-8"),
        ))
    db.commit()
    return RecoveryCodesOut(codes=plaintext_codes)


@app.get("/auth/recovery-codes/status", response_model=RecoveryCodesStatusOut)
def recovery_codes_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(RecoveryCode).filter(RecoveryCode.user_id == user.id).all()
    remaining = sum(1 for r in rows if not r.used)
    return RecoveryCodesStatusOut(total=len(rows), remaining=remaining)


def oauth_exchange_code(cfg: dict, code: str, redirect_uri: str) -> str:
    """Exchange an authorization code for an access token. Returns the access token."""
    token_resp = httpx.post(
        cfg["token_url"],
        data={
            "client_id": cfg["client_id"],
            "client_secret": cfg["client_secret"],
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        headers={"Accept": "application/json"},
        timeout=10,
    )
    if token_resp.status_code != 200:
        raise HTTPException(400, "Failed to exchange the authorization code with the provider")
    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(400, "Provider did not return an access token")
    return access_token


def oauth_fetch_userinfo(cfg: dict, access_token: str) -> dict:
    """Returns a normalized {sub, email} dict."""
    resp = httpx.get(cfg["userinfo_url"], headers={"Authorization": f"Bearer {access_token}"}, timeout=10)
    if resp.status_code != 200:
        raise HTTPException(400, "Failed to fetch your account info from the provider")
    info = resp.json()
    sub = info.get("sub") or info.get("id")
    if not sub:
        raise HTTPException(400, "Provider response did not include an account identifier")
    return {"sub": sub, "email": info.get("email")}


@app.get("/auth/oauth/connections", response_model=OAuthConnectionsOut)
def oauth_connections(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(OAuthAccount).filter(OAuthAccount.user_id == user.id).all()
    return OAuthConnectionsOut(
        connections=[
            OAuthConnectionOut(provider=r.provider, email=r.provider_email, connected_at=r.connected_at)
            for r in rows
        ],
        providers_configured={name: oauth_is_configured(name) for name in OAUTH_PROVIDERS},
    )


# ── Linking flow: attach a provider account to the CURRENTLY LOGGED-IN user ──
# Used by the Security page. Requires an access token.

@app.post("/auth/oauth/{provider}/start", response_model=OAuthStartOut)
def oauth_link_start(provider: str, user: User = Depends(get_current_user)):
    cfg = get_oauth_provider(provider)
    if not oauth_is_configured(provider):
        raise HTTPException(503, f"{provider.capitalize()} OAuth is not configured on this server.")
    state = create_oauth_state_token(user.id)
    params = {
        "client_id": cfg["client_id"],
        "redirect_uri": cfg["link_redirect_uri"],
        "response_type": "code",
        "scope": cfg["scope"],
        "state": state,
        **cfg["extra_authorize_params"],
    }
    return OAuthStartOut(authorize_url=cfg["authorize_url"] + "?" + urllib.parse.urlencode(params))


@app.post("/auth/oauth/{provider}/callback", response_model=MessageOut)
def oauth_link_callback(provider: str, payload: OAuthCallbackIn, db: Session = Depends(get_db)):
    cfg = get_oauth_provider(provider)
    if not oauth_is_configured(provider):
        raise HTTPException(503, f"{provider.capitalize()} OAuth is not configured on this server.")
    claims = decode_token(payload.state, "oauth_state")
    if not claims:
        raise HTTPException(401, "This connection attempt expired. Please try again.")
    user = db.query(User).filter(User.id == int(claims["sub"])).first()
    if not user:
        raise HTTPException(404, "User not found")

    access_token = oauth_exchange_code(cfg, payload.code, cfg["link_redirect_uri"])
    info = oauth_fetch_userinfo(cfg, access_token)

    existing = db.query(OAuthAccount).filter(
        OAuthAccount.user_id == user.id, OAuthAccount.provider == provider
    ).first()
    if existing:
        existing.provider_account_id = info["sub"]
        existing.provider_email = info.get("email")
    else:
        db.add(OAuthAccount(
            user_id=user.id, provider=provider, provider_account_id=info["sub"], provider_email=info.get("email"),
        ))
    db.commit()
    return MessageOut(message=f"Your {provider.capitalize()} account has been connected")


@app.delete("/auth/oauth/connections/{provider}", response_model=MessageOut)
def oauth_disconnect(provider: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deleted = db.query(OAuthAccount).filter(
        OAuthAccount.user_id == user.id, OAuthAccount.provider == provider
    ).delete()
    db.commit()
    if not deleted:
        raise HTTPException(404, "No connection found for that provider")
    return MessageOut(message=f"{provider.capitalize()} account disconnected")


# ── Login/signup flow: sign in (or create an account) via a provider ────────
# Used by the Sign In / Sign Up screens. No prior authentication required.

@app.get("/auth/oauth/{provider}/login/start", response_model=OAuthStartOut)
def oauth_login_start(provider: str):
    cfg = get_oauth_provider(provider)
    if not oauth_is_configured(provider):
        raise HTTPException(503, f"{provider.capitalize()} sign-in is not configured on this server.")
    state = create_oauth_login_state_token()
    params = {
        "client_id": cfg["client_id"],
        "redirect_uri": cfg["login_redirect_uri"],
        "response_type": "code",
        "scope": cfg["scope"],
        "state": state,
        **cfg["extra_authorize_params"],
    }
    return OAuthStartOut(authorize_url=cfg["authorize_url"] + "?" + urllib.parse.urlencode(params))


@app.post("/auth/oauth/{provider}/login/callback", response_model=LoginOut)
def oauth_login_callback(provider: str, payload: OAuthCallbackIn, db: Session = Depends(get_db)):
    cfg = get_oauth_provider(provider)
    if not oauth_is_configured(provider):
        raise HTTPException(503, f"{provider.capitalize()} sign-in is not configured on this server.")
    claims = decode_token(payload.state, "oauth_login_state")
    if not claims:
        raise HTTPException(401, "This sign-in attempt expired. Please try again.")

    access_token = oauth_exchange_code(cfg, payload.code, cfg["login_redirect_uri"])
    info = oauth_fetch_userinfo(cfg, access_token)

    existing_link = db.query(OAuthAccount).filter(
        OAuthAccount.provider == provider, OAuthAccount.provider_account_id == info["sub"]
    ).first()

    if existing_link:
        user = db.query(User).filter(User.id == existing_link.user_id).first()
    else:
        user = db.query(User).filter(User.email == info.get("email")).first() if info.get("email") else None
        if not user:
            if not info.get("email"):
                raise HTTPException(400, f"{provider.capitalize()} did not share an email address to create your account")
            user = User(
                email=info["email"],
                hashed_password=hash_password(secrets.token_urlsafe(32)),
            )
            db.add(user)
            db.flush()
        db.add(OAuthAccount(
            user_id=user.id, provider=provider, provider_account_id=info["sub"], provider_email=info.get("email"),
        ))

    if not user or not user.is_active:
        db.commit()
        raise HTTPException(403, "This account is deactivated")
    db.commit()
    db.refresh(user)

    if user.mfa_enabled:
        return LoginOut(mfa_required=True, mfa_token=create_mfa_token(user.id))

    return LoginOut(
        mfa_required=False,
        token=TokenOut(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id)),
        user=UserOut.model_validate(user),
    )


@app.post("/auth/change-password", response_model=MessageOut)
def change_password(payload: ChangePasswordIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(401, "Current password is incorrect")
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageOut(message="Your password has been updated")


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.post("/auth/logout", response_model=MessageOut)
def logout(user: User = Depends(get_current_user)):
    # Access tokens are stateless JWTs; the client simply discards them.
    return MessageOut(message="Logged out successfully")


@app.post("/auth/forgot-password", response_model=ForgotPasswordOut)
def forgot_password(payload: ForgotPasswordIn, db: Session = Depends(get_db)):
    generic = "If an account with that email exists, a reset link has been sent."
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return ForgotPasswordOut(message=generic)

    raw_token = secrets.token_urlsafe(32)
    db.add(PasswordResetToken(
        user_id=user.id,
        token=raw_token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
    ))
    db.commit()
    # TODO: send raw_token by email instead of returning it directly.
    return ForgotPasswordOut(message=generic, reset_token=raw_token)


@app.post("/auth/reset-password", response_model=MessageOut)
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)):
    row = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.token, PasswordResetToken.used.is_(False)
    ).first()
    if not row or row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "Invalid or expired reset token")

    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        raise HTTPException(400, "Invalid or expired reset token")

    user.hashed_password = hash_password(payload.new_password)
    row.used = True
    db.commit()
    return MessageOut(message="Password has been reset successfully")
