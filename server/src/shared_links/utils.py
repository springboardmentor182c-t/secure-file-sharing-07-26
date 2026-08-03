"""
Small helpers used by the Shared Links service layer: pagination math,
share-URL building, password hashing (bcrypt via Passlib), and
expiry/date validation.
"""
import os
import uuid
from datetime import datetime
from typing import Optional

from passlib.context import CryptContext

from src.pagination import build_pagination_meta  # noqa: F401 (re-exported)

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "https://localhost/share")


# ---------------------------------------------------------------------------
# Password hashing (for the optional per-link password protection feature —
# NOT for user account passwords, which belong to the Auth module)
# ---------------------------------------------------------------------------

def hash_password(plain_password: str) -> str:
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    if not hashed_password:
        return False
    return _pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# Share URL / expiry helpers
# ---------------------------------------------------------------------------

def build_share_url(link_id: uuid.UUID) -> str:
    return f"{PUBLIC_BASE_URL.rstrip('/')}/{link_id}"


def is_expired(expires_at: Optional[datetime]) -> bool:
    if expires_at is None:
        return False
    naive_expiry = expires_at.replace(tzinfo=None) if expires_at.tzinfo else expires_at
    return naive_expiry <= datetime.utcnow()


def hours_until(expires_at: Optional[datetime]) -> Optional[float]:
    if expires_at is None:
        return None
    naive_expiry = expires_at.replace(tzinfo=None) if expires_at.tzinfo else expires_at
    return (naive_expiry - datetime.utcnow()).total_seconds() / 3600
