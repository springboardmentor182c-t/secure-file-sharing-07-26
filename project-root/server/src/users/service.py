import uuid
from typing import Optional
from sqlalchemy.orm import Session
from src.entities.user import User
from src.auth.dependencies import hash_password


def list_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.created_at.desc()).all()


def update_user(
    db: Session,
    user_id: uuid.UUID,
    role: Optional[str] = None,
    plan: Optional[str] = None,
    is_active: Optional[bool] = None,
    storage_quota: Optional[int] = None,
) -> User | None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    if role is not None:
        user.role = role
    if plan is not None:
        user.plan = plan
    if is_active is not None:
        user.is_active = is_active
    if storage_quota is not None:
        user.storage_quota = storage_quota
    db.commit()
    db.refresh(user)
    return user


def update_profile(
    db: Session,
    user: User,
    name: Optional[str] = None,
    avatar_color: Optional[str] = None,
) -> User:
    if name is not None:
        user.name = name
    if avatar_color is not None:
        user.avatar_color = avatar_color
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, new_password: str) -> None:
    user.hashed_password = hash_password(new_password)
    db.commit()
