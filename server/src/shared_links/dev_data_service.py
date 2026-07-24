
import uuid
from typing import Sequence

from sqlalchemy.orm import Session

from src.entities.user import User
from src.exceptions import ConflictError
from src.shared_links.models import UserCreate


def create_user(db: Session, data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise ConflictError(f"A user with email {data.email} already exists")
    user = User(email=data.email, full_name=data.full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session) -> Sequence[User]:
    return db.query(User).all()
