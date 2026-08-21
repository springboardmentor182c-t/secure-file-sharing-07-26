from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.entities.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    type: str,
    category: str,
    title: str,
    message: str,
    icon: str | None = None,
    resource_id: int | None = None,
    resource_type: str | None = None,
    commit: bool = False,
) -> Notification:
    """Create a persisted notification within the caller's transaction."""
    values = {
        "user_id": user_id,
        "type": type,
        "category": category,
        "title": title,
        "message": message,
    }
    if icon is not None:
        values["icon"] = icon
    if resource_id is not None:
        values["resource_id"] = resource_id
    if resource_type is not None:
        values["resource_type"] = resource_type

    notification = Notification(**values)
    db.add(notification)
    if commit:
        db.commit()
        db.refresh(notification)
    else:
        db.flush()
    return notification


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
        .update({"is_read": True}, synchronize_session=False)
    )
    db.commit()
    return updated


def delete_notification(db: Session, notification_id: int, user_id: int) -> None:
    notification = _user_notification(db, notification_id, user_id)
    db.delete(notification)
    db.commit()


def delete_all_notifications(db: Session, user_id: int) -> int:
    deleted = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return deleted


def _user_notification(db: Session, notification_id: int, user_id: int) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return notification