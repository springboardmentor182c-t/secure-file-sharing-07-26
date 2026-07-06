from sqlalchemy.orm import Session
from src.entities.notification import Notification
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationOut(BaseModel):
    id: int
    type: str
    category: str
    title: str
    message: str
    icon: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


def get_notifications(db: Session, user_id: int) -> list[NotificationOut]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


def mark_read(db: Session, notif_id: int, user_id: int) -> None:
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user_id).first()
    if n:
        n.is_read = True
        db.commit()


def mark_all_read(db: Session, user_id: int) -> None:
    db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
    db.commit()


def delete_notification(db: Session, notif_id: int, user_id: int) -> None:
    db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user_id).delete()
    db.commit()


def create_notification(db: Session, user_id: int, type: str, category: str, title: str, message: str, icon: str = "🔔") -> None:
    """Helper used by other services to push notifications."""
    n = Notification(user_id=user_id, type=type, category=category, title=title, message=message, icon=icon)
    db.add(n)
    db.commit()
