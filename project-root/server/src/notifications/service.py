import uuid
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.entities.notification import Notification
from src.entities.user import User

# Recognised notification categories. Anything else is stored as "info".
NOTIFICATION_TYPES = (
    "share",
    "download",
    "access_denied",
    "login",
    "expiry",
    "info",
)

DEFAULT_LIMIT = 100
MAX_LIMIT = 500


def list_notifications(
    db: Session,
    user: User,
    type: str | None = None,
    unread_only: bool = False,
    limit: int = DEFAULT_LIMIT,
    offset: int = 0,
) -> list[Notification]:
    """Notifications for `user`, newest first, optionally filtered by category."""
    q = db.query(Notification).filter(Notification.user_id == user.id)

    if type:
        q = q.filter(Notification.type == type)
    if unread_only:
        q = q.filter(Notification.read == False)  # noqa: E712

    # `id` breaks ties so offset/limit paging stays stable when several rows
    # share a created_at (SQLite timestamps are only second-granular).
    return (
        q.order_by(Notification.created_at.desc(), Notification.id.desc())
        .offset(max(offset, 0))
        .limit(min(max(limit, 1), MAX_LIMIT))
        .all()
    )


def count_unread(db: Session, user: User) -> int:
    return (
        db.query(func.count(Notification.id))
        .filter(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
        .scalar()
        or 0
    )


def summarize(db: Session, user: User) -> dict:
    """Totals plus a per-category unread breakdown (zero-filled for every type)."""
    total = (
        db.query(func.count(Notification.id))
        .filter(Notification.user_id == user.id)
        .scalar()
        or 0
    )

    rows = (
        db.query(Notification.type, func.count(Notification.id))
        .filter(Notification.user_id == user.id, Notification.read == False)  # noqa: E712
        .group_by(Notification.type)
        .all()
    )

    unread_by_type = {t: 0 for t in NOTIFICATION_TYPES}
    for notif_type, count in rows:
        unread_by_type[notif_type or "info"] = count

    return {
        "total": total,
        "unread": sum(unread_by_type.values()),
        "unread_by_type": unread_by_type,
    }


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


def mark_all_read(db: Session, user: User, type: str | None = None) -> int:
    """Mark every unread notification read; scoped to one category when given."""
    q = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.read == False,  # noqa: E712
    )
    if type:
        q = q.filter(Notification.type == type)

    count = q.update({"read": True}, synchronize_session=False)
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


def clear_notifications(db: Session, user: User, read_only: bool = False) -> int:
    """Delete the user's notifications — all of them, or only the read ones."""
    q = db.query(Notification).filter(Notification.user_id == user.id)
    if read_only:
        q = q.filter(Notification.read == True)  # noqa: E712

    count = q.delete(synchronize_session=False)
    db.commit()
    return count


def create_notification(
    db: Session,
    user_id: uuid.UUID,
    title: str,
    message: str,
    type: str = "info",
) -> Notification:
    """Raise a notification for a user. Other modules call this to emit events."""
    n = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type if type in NOTIFICATION_TYPES else "info",
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n
