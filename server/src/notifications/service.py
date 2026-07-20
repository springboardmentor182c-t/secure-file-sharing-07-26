from sqlalchemy.orm import Session

from src.entities.notification import Notification



def get_notifications(
    db: Session,
    user_id
):

    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )



def create_notification(
    db: Session,
    user_id,
    notification_type,
    title,
    message,
    shared_link_id=None
):

    notification = Notification(
    user_id=user_id,
    notification_type=type_.value,
    title=title,
    message=message,
    related_entity="shared_link",
    related_entity_id=shared_link_id,
)


    db.add(notification)

    db.commit()

    db.refresh(notification)


    return notification