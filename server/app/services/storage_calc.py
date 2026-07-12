from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.file import File

def get_total_storage_gb(db: Session) -> float:
    total_mb = db.query(func.sum(User.storage_used_mb)).scalar() or 0
    return round(total_mb / 1024, 2)

def get_storage_by_user(db: Session):
    users = db.query(User).all()
    return [
        {"user": u.name, "storage_gb": round(u.storage_used_mb / 1024, 2)}
        for u in users
    ]

def recalculate_user_storage(db: Session, user_id: int):
    """Recalculates a user's total storage based on their actual files."""
    total_mb = (
        db.query(func.sum(File.size_mb))
        .filter(File.user_id == user_id)
        .scalar() or 0
    )
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.storage_used_mb = total_mb
        db.commit()
    return total_mb