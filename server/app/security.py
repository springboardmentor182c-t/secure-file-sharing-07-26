import hashlib
import secrets
import datetime as dt

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password hashing ────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Opaque token hashing (refresh tokens, reset tokens, backup codes) ──
# We never store raw secrets in the DB - only a SHA-256 hash, so a DB leak
# doesn't hand over usable tokens.
def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


def generate_raw_token(n_bytes: int = 32) -> str:
    return secrets.token_urlsafe(n_bytes)


# ── JWT access tokens ───────────────────────────────────────────────────
def create_access_token(user_id: str) -> str:
    now = dt.datetime.utcnow()
    payload = {
        "sub": user_id,
        "type": "access",
        "iat": now,
        "exp": now + dt.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_mfa_pending_token(user_id: str) -> str:
    """Short-lived token issued after password check, before MFA code is verified."""
    now = dt.datetime.utcnow()
    payload = {
        "sub": user_id,
        "type": "mfa_pending",
        "iat": now,
        "exp": now + dt.timedelta(minutes=5),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
