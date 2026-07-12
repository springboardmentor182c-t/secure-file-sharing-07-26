from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.stats import SummaryStats, UserStorage

router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/summary", response_model=SummaryStats)
def get_summary(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "Active").count()
    total_storage_mb = db.query(func.sum(User.storage_used_mb)).scalar() or 0
    files_this_month = db.query(func.sum(User.files_count)).scalar() or 0

    return SummaryStats(
        total_users=total_users,
        active_users=active_users,
        total_storage_gb=round(total_storage_mb / 1024, 2),
        files_this_month=files_this_month
    )

@router.get("/storage", response_model=List[UserStorage])
def get_storage_by_user(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        UserStorage(user=u.name, storage_gb=round(u.storage_used_mb / 1024, 2))
        for u in users
    ]