from sqlalchemy.orm import Session
from .models import Activity


def get_all_activities(db: Session):
    return (
        db.query(Activity)
        .order_by(Activity.created_at.desc())
        .all()
    )


def create_activity(
    db: Session,
    username: str,
    action: str,
    file_name: str,
    resource: str | None = None,
    ip_address: str | None = None,
    status: str = "success",
    details: str | None = None,
):
    activity = Activity(
        username=username,
        action=action,
        file_name=file_name,
        resource=resource,
        ip_address=ip_address,
        status=status,
        details=details,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity