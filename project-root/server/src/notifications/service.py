import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.entities.notification import Notification
from src.entities.user import User
from src.realtime.manager import emit_sync


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
        emit_sync(user.id, "notification_updated", {
            "id": str(n.id),
            "read": True,
        })
    return n


def mark_all_read(db: Session, user: User) -> int:
    count = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
        .update({"read": True})
    )
    db.commit()
    emit_sync(user.id, "notification_all_read", {
        "count": count,
    })
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
    emit_sync(user.id, "notification_deleted", {
        "id": str(notif_id),
    })
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

    # Real-time event push to user
    emit_sync(user_id, "notification_new", {
        "id": str(n.id),
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "read": n.read,
        "created_at": n.created_at.isoformat() if n.created_at else datetime.now(timezone.utc).isoformat(),
    })
    return n
