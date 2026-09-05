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
            "user_id": a.user_id,
            "file_id": a.file_id,
            "action": a.action,
            "module": a.module,
            "description": a.description,
            "resource": a.resource,
            "ip_address": a.ip_address,
            "device_info": a.device_info,
            "status": a.status,
            "details": a.details,
            "created_at": a.created_at,
        }
        for a in activities
    ]

