from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.notifications.service import NotificationOut, get_notifications, mark_read, mark_all_read, delete_notification

router = APIRouter()


@router.get("/", response_model=list[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_notifications(db, current_user.id)


@router.patch("/{notif_id}/read", status_code=204)
def read_one(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mark_read(db, notif_id, current_user.id)


@router.patch("/read-all", status_code=204)
def read_all(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    mark_all_read(db, current_user.id)


@router.delete("/{notif_id}", status_code=204)
def delete(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    delete_notification(db, notif_id, current_user.id)
