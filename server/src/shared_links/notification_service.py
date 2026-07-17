"""In-app notification persistence, used by the scheduler and exposed via
the /notifications endpoints."""
import uuid
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from src.entities.notification import Notification
from src.shared_links.constants import NotificationType


def create_notification(
    db: Session, *, user_id: uuid.UUID, shared_link_id: Optional[uuid.UUID],
    type_: NotificationType, title: str, message: str,
) -> Notification:
    notification = Notification(
        user_id=user_id, shared_link_id=shared_link_id, type=type_, title=title, message=message,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def list_for_user(db: Session, user_id: uuid.UUID, limit: int = 50) -> Sequence[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


def mark_read(db: Session, notification_id: uuid.UUID) -> Optional[Notification]:
    notification = db.get(Notification, notification_id)
    if notification is None:
        return None
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
