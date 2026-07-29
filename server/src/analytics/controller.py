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
def get_storage(filter_range: str = Query("Last 12 months", alias="range"), db: Session = Depends(get_db)):
    """Fetch storage metrics and department breakdown"""
    return AnalyticsService.get_storage_data(db)

@router.get("/downloads")
def get_downloads(filter_range: str = Query("Last 30 Days", alias="range"), db: Session = Depends(get_db)):
    """Fetch download traffic trend and top files"""
    # Returning empty data to match the removed dummy data on frontend
    return {"hourly_trend": [], "top_downloaded_files": []}

@router.get("/security")
def get_security(filter_range: str = Query("Last 30 Days", alias="range"), db: Session = Depends(get_db)):
    """Fetch security incident audit trail"""
    # Returning empty data to match the removed dummy data on frontend
    return {"events": []}

@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    """Fetch list of generated analytics reports"""
    return AnalyticsService.get_reports(db)

@router.post("/reports", status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreateSchema, db: Session = Depends(get_db)):
    """Generate a new analytics report schedule"""
    return AnalyticsService.create_report(db, payload.type)