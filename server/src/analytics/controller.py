from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from src.database.core import get_db
from .service import AnalyticsService
from .schema import ReportCreateSchema

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/summary")
def get_summary(filter_range: str = Query("Last 30 Days", alias="range"), db: Session = Depends(get_db)):
    """Fetch analytics overview metrics summary"""
    return AnalyticsService.get_summary(db)

@router.get("/storage")
def get_storage(db: Session = Depends(get_db)):
    """Fetch storage metrics and department breakdown"""
    return AnalyticsService.get_storage_data(db)

@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    """Fetch list of generated analytics reports"""
    return AnalyticsService.get_reports(db)

@router.post("/reports", status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreateSchema, db: Session = Depends(get_db)):
    """Generate a new analytics report schedule"""
    return AnalyticsService.create_report(db, payload.type)