from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.notifications.service import (
    NotificationOut,
    get_notifications,
    mark_read,
    mark_all_read,
    delete_notification,
    create_notification,
)

router = APIRouter()


# -------------------------------
# Get Notifications
# -------------------------------
@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notifications(db, current_user.id)


# -------------------------------
# Mark Single Notification Read
# -------------------------------
@router.patch("/{notif_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def read_one(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mark_read(db, notif_id, current_user.id)
    return None


# -------------------------------
# Mark All Notifications Read
# -------------------------------
@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mark_all_read(db, current_user.id)
    return None


# -------------------------------
# Delete Notification
# -------------------------------
@router.delete("/{notif_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_notification(db, notif_id, current_user.id)
    return None


# ==========================================================
# Seed Sample Notifications (Development / Testing Only)
# ==========================================================
@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id

    create_notification(
        db,
        user_id=user_id,
        type="share",
        category="shares",
        title="File Shared",
        message="John shared 'Project.pdf' with you.",
        icon="🔗",
    )

    create_notification(
        db,
        user_id=user_id,
        type="upload",
        category="uploads",
        title="Upload Complete",
        message="Report.docx uploaded successfully.",
        icon="⬆️",
    )

    create_notification(
        db,
        user_id=user_id,
        type="security",
        category="security",
        title="Security Alert",
        message="New login detected from Chrome.",
        icon="🛡️",
    )

    create_notification(
        db,
        user_id=user_id,
        type="download",
        category="activity",
        title="Download Finished",
        message="Design.zip downloaded.",
        icon="⬇️",
    )

    create_notification(
        db,
        user_id=user_id,
        type="access",
        category="activity",
        title="File Viewed",
        message="Rahul viewed your presentation.",
        icon="👁️",
    )

    return {"message": "Sample notifications created successfully."}