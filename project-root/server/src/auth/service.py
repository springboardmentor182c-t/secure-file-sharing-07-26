from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.entities.user import User
from src.auth.models import SignupRequest, TokenResponse, UserOut
from src.auth.dependencies import hash_password, verify_password, create_access_token, create_refresh_token
from src.auth import email_service
import os
import random
import secrets
from datetime import datetime, timedelta, timezone

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# In-memory store for OTPs: {user_id: {"otp": str, "expires_at": datetime}}
otp_store = {}


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def register_user(db: Session, data: SignupRequest) -> TokenResponse:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # First user becomes admin
    is_first = db.query(User).count() == 0

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role="admin" if is_first else "member",
        plan="enterprise" if is_first else "free",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _build_token_response(user)


def _build_token_response(user: User) -> TokenResponse:
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
        mfa_required=False,
    )


# ── MFA Helpers ────────────────────────────────────────────────────────────

def generate_otp(user_id: int, to_email: str = "", user_name: str = "") -> str:
    """Generate a 6-digit OTP, store it with a 5-minute expiry, and email it to the user."""
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    otp_store[user_id] = {"otp": code, "expires_at": expires_at}

    # Send OTP via real email (falls back to console log if SMTP not configured)
    if to_email:
        email_service.send_otp_email(to_email, code, user_name)
    else:
        print(f"[OTP] Code for user {user_id}: {code} (expires {expires_at} UTC)", flush=True)

    return code


def verify_otp_code(user_id: int, code: str) -> bool:
    entry = otp_store.get(user_id)
    if not entry:
        return False
    if entry["otp"] != code:
        return False
    if datetime.now(timezone.utc) > entry["expires_at"]:
        otp_store.pop(user_id, None)
        return False
    # Valid OTP
    otp_store.pop(user_id, None)
    return True


def build_mfa_pending_response(user: User) -> TokenResponse:
    """Build an MFA-pending response and send the OTP to the user's email."""
    token_data = {"sub": str(user.id), "type": "mfa_pending"}
    mfa_token = create_access_token(token_data, expires_delta=timedelta(minutes=10))
    # Pass user's email and name so the OTP email can be addressed personally
    generate_otp(user.id, to_email=user.email, user_name=user.name)
    return TokenResponse(
        mfa_required=True,
        mfa_token=mfa_token,
    )


# ── Password Recovery Helpers ──────────────────────────────────────────────

def request_password_reset(db: Session, email: str):
    """Generate a password reset token and email a reset link to the user."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal whether the email exists — silently return
        return

    # Create a signed reset token valid for 15 minutes
    token_data = {"sub": str(user.id), "type": "password_recovery"}
    reset_token = create_access_token(token_data, expires_delta=timedelta(minutes=15))

    # Build the reset URL pointing to the frontend page
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    # Send the reset email (falls back to console log if SMTP not configured)
    email_service.send_reset_email(user.email, reset_link, user.name)


def reset_password_in_db(db: Session, token: str, new_password: str) -> bool:
    from src.auth.dependencies import decode_token
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if payload.get("type") != "password_recovery":
        raise HTTPException(status_code=400, detail="Invalid token type")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(new_password)
    db.commit()
    return True


# ── OAuth Helpers ──────────────────────────────────────────────────────────

def get_or_create_oauth_user(db: Session, provider: str, email: str, name: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create a new user with random password
        random_password = secrets.token_urlsafe(16)
        is_first = db.query(User).count() == 0
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(random_password),
            role="admin" if is_first else "member",
            plan="enterprise" if is_first else "free",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def enable_mfa(db: Session, user: User) -> User:
    user.mfa_enabled = True
    db.commit()
    db.refresh(user)
    return user


def disable_mfa(db: Session, user: User) -> User:
    user.mfa_enabled = False
    db.commit()
    db.refresh(user)
    return user