import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.entities.notification import Notification
from src.entities.user import User


def list_notifications(db: Session, user: User) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(100)
        .all()
    )


def mark_read(db: Session, notif_id: uuid.UUID, user: User) -> Notification | None:
    n = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user.id,
    ).first()
    if n:
        n.read = True
        db.commit()
        db.refresh(n)
    return n


def mark_all_read(db: Session, user: User) -> int:
    count = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
        .update({"read": True})
    )
    db.commit()
    return count


def delete_notification(db: Session, notif_id: uuid.UUID, user: User) -> bool:
    n = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user.id,
    ).first()
    if not n:
        return False
    db.delete(n)
    db.commit()
    return True


def create_notification(
    db: Session,
    user_id: uuid.UUID,
    title: str,
    message: str,
    type: str = "info",
) -> Notification:
    n = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n
