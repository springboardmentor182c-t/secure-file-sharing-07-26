"""
Auth business logic: password hashing, JWT issuance/verification,
TOTP-based MFA, and recovery codes.
"""
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import pyotp
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src.entities.user import User
from src.exceptions import (
    ConflictError,
    InvalidPasswordError,
    UnauthorizedError,
    ValidationError,
)

# --- config (env-driven, sane dev defaults) ---
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-insecure-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days
MFA_TOKEN_EXPIRE_MINUTES = int(os.getenv("MFA_TOKEN_EXPIRE_MINUTES", "10"))
MFA_ISSUER_NAME = os.getenv("MFA_ISSUER_NAME", "TrustShare")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------- passwords ----------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    if not hashed:
        return False
    return pwd_context.verify(password, hashed)


# ---------- JWT ----------

def _create_token(*, subject: int, token_type: str, expires_minutes: int, extra: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_access_token(user_id: int) -> str:
    return _create_token(subject=user_id, token_type="access", expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES)


def create_mfa_token(user_id: int) -> str:
    return _create_token(subject=user_id, token_type="mfa", expires_minutes=MFA_TOKEN_EXPIRE_MINUTES)


def decode_token(token: str, *, expected_type: str) -> int:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise UnauthorizedError("Invalid or expired token.")

    if payload.get("type") != expected_type:
        raise UnauthorizedError("Invalid token type.")

    try:
        return int(payload["sub"])
    except (KeyError, ValueError):
        raise UnauthorizedError("Invalid token payload.")


# ---------- signup / login ----------

def register_user(db: Session, *, full_name: str, email: str, password: str) -> User:
    email_normalized = email.strip().lower()
    existing = db.query(User).filter(User.email == email_normalized).first()
    if existing:
        raise ConflictError("An account with this email already exists.", error_code="email_taken")

    user = User(
        username=full_name.strip(),
        email=email_normalized,
        hashed_password=hash_password(password),
        role="Admin",
        mfa=False,
        last_login=datetime.now().strftime("%Y-%m-%d %H:%M"),
        status="active",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, *, email: str, password: str) -> User:
    email_normalized = email.strip().lower()
    user = db.query(User).filter(User.email == email_normalized).first()
    if not user or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password.", error_code="invalid_credentials")

    user.last_login = datetime.now().strftime("%Y-%m-%d %H:%M")
    db.commit()
    return user


def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise UnauthorizedError("User not found.")
    return user


# ---------- TOTP / MFA ----------

def generate_totp_secret() -> str:
    return pyotp.random_base32()


def get_provisioning_uri(secret: str, email: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=MFA_ISSUER_NAME)


def verify_totp_code(secret: str, code: str) -> bool:
    if not secret:
        return False
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def _generate_recovery_codes(count: int = 8) -> list[str]:
    return ["-".join([secrets.token_hex(2), secrets.token_hex(2)]) for _ in range(count)]


def enable_mfa(db: Session, user: User, *, code: str) -> list[str]:
    if not user.mfa_secret:
        raise ValidationError("Call /auth/mfa/setup first to generate a secret.")
    if not verify_totp_code(user.mfa_secret, code):
        raise InvalidPasswordError("Incorrect verification code.", error_code="invalid_mfa_code")

    plain_codes = _generate_recovery_codes()
    hashed_codes = [hash_password(c) for c in plain_codes]

    import json
    user.mfa = True
    user.mfa_recovery_codes = json.dumps(hashed_codes)
    db.commit()
    return plain_codes


def disable_mfa(db: Session, user: User) -> None:
    user.mfa = False
    user.mfa_secret = None
    user.mfa_recovery_codes = None
    db.commit()


def start_mfa_setup(db: Session, user: User) -> tuple[str, str]:
    secret = generate_totp_secret()
    user.mfa_secret = secret
    db.commit()
    return secret, get_provisioning_uri(secret, user.email)


def verify_mfa_code(db: Session, user: User, *, code: str) -> None:
    if not verify_totp_code(user.mfa_secret, code):
        raise InvalidPasswordError("That code didn't work. Please try again.", error_code="invalid_mfa_code")


def consume_recovery_code(db: Session, user: User, *, recovery_code: str) -> None:
    import json

    if not user.mfa_recovery_codes:
        raise InvalidPasswordError("That recovery code didn't work.", error_code="invalid_recovery_code")

    hashed_codes = json.loads(user.mfa_recovery_codes)
    for i, hashed in enumerate(hashed_codes):
        if verify_password(recovery_code.strip(), hashed):
            hashed_codes.pop(i)  # one-time use
            user.mfa_recovery_codes = json.dumps(hashed_codes)
            db.commit()
            return

    raise InvalidPasswordError("That recovery code didn't work.", error_code="invalid_recovery_code")