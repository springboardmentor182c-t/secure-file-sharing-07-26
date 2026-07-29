from sqlalchemy.orm import Session

from src.entities.notification import Notification


def get_notifications(db: Session, user_id):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def create_notification(
    db: Session,
    user_id,
    notification_type,
    title,
    message,
    shared_link_id=None,
):
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        shared_link_id=shared_link_id,
        email_sent=False,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification
