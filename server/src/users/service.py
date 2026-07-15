from sqlalchemy.orm import Session
from typing import Optional
from src.entities.user import User
from src.users.models import UserCreate, UserUpdate
from src.auth.service import get_password_hash

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_create: UserCreate) -> User:
    hashed_pw = get_password_hash(user_create.password)
    db_user = User(
        email=user_create.email,
        hashed_password=hashed_pw,
        full_name=user_create.full_name,
        bio="",
        avatar="default",
        theme="dark",
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_update: UserUpdate) -> User:
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        db_user.hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
