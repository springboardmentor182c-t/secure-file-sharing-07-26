from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.database.core import get_db
from src.entities.user import User
from src.notifications import schemas, service


router = APIRouter()


@router.get("/", response_model=list[schemas.NotificationOut])
def read_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_user_notifications(db, current_user.id)


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.mark_notification_read(db, notification_id, current_user.id)


@router.patch("/read-all", response_model=schemas.MarkAllReadResponse)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"updated": service.mark_all_notifications_read(db, current_user.id)}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service.delete_notification(db, notification_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
