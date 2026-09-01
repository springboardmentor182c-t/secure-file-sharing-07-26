from sqlalchemy.orm import Session
from fastapi import HTTPException

from src.entities.user import User
from src.entities.audit_log import AuditLog


def get_all_users(db: Session):
    return db.query(User).all()


def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_user(
    db: Session,
    user: User,
    role: str,
    plan: str | None = None,
    is_active: bool | None = None,
):
    user.role = role

    if plan is not None:
        user.plan = plan

    if is_active is not None:
        user.is_active = is_active

    db.commit()
    db.refresh(user)
    return user


def get_admin_stats(db: Session):
    total_users = db.query(User).count()

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    admins = (
        db.query(User)
        .filter(User.role == "admin")
        .count()
    )

    audit_logs = db.query(AuditLog).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "admins": admins,
        "audit_logs": audit_logs,
    }