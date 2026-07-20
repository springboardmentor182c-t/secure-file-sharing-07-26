import uuid
import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.entities.user import User

SECRET_KEY = os.getenv("SECRET_KEY", "secureshare-super-secret-key-change-in-prod-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 30
MFA_CHALLENGE_EXPIRE_MINUTES = 5
RESET_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_mfa_challenge_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=MFA_CHALLENGE_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "type": "mfa", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def create_reset_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "type": "reset", "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    db: Session = Depends(get_db),
) -> User:
    """Dev mode: return the first active user in the DB without any token check."""
    user = db.query(User).filter(User.is_active == True).first()
    if user is None:
        # Create a default dev user if the DB is empty
        user = User(
            id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
            name="Alex Johnson",
            email="alex@secureshare.dev",
            hashed_password=hash_password("devpassword"),
            role="admin",
            plan="enterprise",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    return current_user


