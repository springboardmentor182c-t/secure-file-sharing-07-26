from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.entities.notification import Notification


def get_user_notifications(db: Session, user_id: int) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .all()
    )


def mark_notification_read(db: Session, notification_id: int, user_id: int) -> Notification:
    notification = _user_notification(db, notification_id, user_id)
    if not notification.is_read:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification


def mark_all_notifications_read(db: Session, user_id: int) -> int:
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)
        .update({Notification.is_read: True}, synchronize_session=False)
    )
    db.commit()
    return updated


def delete_notification(db: Session, notification_id: int, user_id: int) -> None:
    notification = _user_notification(db, notification_id, user_id)
    db.delete(notification)
    db.commit()


def _user_notification(db: Session, notification_id: int, user_id: int) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return notification
