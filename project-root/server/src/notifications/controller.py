from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.notifications import service

router = APIRouter(tags=["Notifications"])

@router.get("")
@router.get("/")
def read_notifications(db: Session = Depends(get_db)):
    return service.get_user_notifications(db)