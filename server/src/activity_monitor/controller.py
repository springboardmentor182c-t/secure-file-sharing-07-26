from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from .service import get_all_activities

router = APIRouter()


@router.get("/")
def read_activity(db: Session = Depends(get_db)):
    activities = get_all_activities(db)
    return [
        {
            "id": a.id,
            "username": a.username,
            "action": a.action,
            "file_name": a.file_name,
            "resource": a.resource,
            "ip_address": a.ip_address,
            "status": a.status,
            "details": a.details,
            "created_at": a.created_at,
        }
        for a in activities
    ]

