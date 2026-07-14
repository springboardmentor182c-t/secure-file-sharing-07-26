from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.dashboard import controller, schemas
from app.database.session import get_db


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    return controller.read_summary(db)


@router.get("/recent-files", response_model=list[schemas.RecentFile])
def get_recent_files(db: Session = Depends(get_db)):
    return controller.read_recent_files(db)


@router.get("/recent-activity", response_model=list[schemas.RecentActivity])
def get_recent_activity(db: Session = Depends(get_db)):
    return controller.read_recent_activity(db)


@router.get("/notifications", response_model=list[schemas.NotificationPreview])
def get_notifications(db: Session = Depends(get_db)):
    return controller.read_notifications(db)


@router.get("/storage", response_model=schemas.DashboardStorage)
def get_storage(db: Session = Depends(get_db)):
    return controller.read_storage(db)


@router.get("/security-status", response_model=list[schemas.SecurityStatus])
def get_security_status(db: Session = Depends(get_db)):
    return controller.read_security_status(db)


@router.get("/charts", response_model=schemas.DashboardChartsResponse)
def get_charts(db: Session = Depends(get_db)):
    return controller.read_charts(db)


@router.get("/team-activity", response_model=list[schemas.TeamActivity])
def get_team_activity(db: Session = Depends(get_db)):
    return controller.read_team_activity(db)
