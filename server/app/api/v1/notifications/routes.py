from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db

from .schemas import Notification
from .models import NotificationModel


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/", response_model=list[Notification])
def get_notifications(db: Session = Depends(get_db)):
    notifications = db.query(NotificationModel).all()
    return notifications