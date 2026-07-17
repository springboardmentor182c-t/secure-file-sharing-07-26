from sqlalchemy.orm import Session

from src.activity.models import ActivityCreate
from src.entities.activity import Activity


def create_activity(db: Session, activity_data: ActivityCreate):
    new_activity = Activity(
        user_id=activity_data.user_id,
        action=activity_data.action,
        file_name=activity_data.file_name,
        description=activity_data.description,
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity


def get_all_activities(db: Session):
    return db.query(Activity).order_by(Activity.created_at.desc()).all()


def get_user_activities(db: Session, user_id: int):
    return (
        db.query(Activity)
        .filter(Activity.user_id == user_id)
        .order_by(Activity.created_at.desc())
        .all()
    )