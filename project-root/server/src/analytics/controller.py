# server/src/analytics/controller.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User

from src.analytics.service import AnalyticsService
from src.analytics.schemas import (
    StorageResponse,
    UploadAnalyticsResponse,
    DownloadAnalyticsResponse,
    SharingAnalyticsResponse,
    SecurityAnalyticsResponse,
    RecentActivityResponse,
    AnalyticsSummaryResponse,
    UserListResponse,
    SystemStatsResponse,
)

from fastapi.responses import StreamingResponse
from io import BytesIO
from src.analytics.services.pdf_exporter import (
    generate_file_analytics_pdf,
    generate_security_pdf,
)
from datetime import datetime


router = APIRouter()
service = AnalyticsService()


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def summary(
    days: int = Query(30, ge=1, le=365),
    user_id: int | None = Query(None, description="Filter activity by user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full analytics + security summary."""
    return service.get_summary(db, days=days, user_id=user_id)


@router.get("/storage", response_model=StorageResponse)
def storage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_storage(db)


@router.get("/uploads", response_model=UploadAnalyticsResponse)
def uploads(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_upload_analytics(db, days=days)


@router.get("/downloads", response_model=DownloadAnalyticsResponse)
def downloads(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_download_analytics(db, days=days)


@router.get("/sharing", response_model=SharingAnalyticsResponse)
def sharing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_sharing_analytics(db)


@router.get("/security", response_model=SecurityAnalyticsResponse)
def security(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_security_analytics(db, days=days)


@router.get("/recent-activity", response_model=RecentActivityResponse)
def recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"activities": service.get_recent_activity(db)}

# ═══════════════════════════════════════════════════════════════════════════
# PDF EXPORT
# ═══════════════════════════════════════════════════════════════════════════

def _date_range_label(days: int) -> str:
    """Format date range for PDF header."""
    if days == 7:
        return "Last 7 days"
    if days == 30:
        return "Last 30 days"
    if days == 90:
        return "Last 90 days"
    return f"Last {days} days"


@router.get("/export/file-analytics")
def export_file_analytics_pdf(
    days: int = Query(30, ge=1, le=365),
    db:   Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download File Analytics tab as PDF."""
    data = service.get_summary(db, days=days)
    pdf_bytes = generate_file_analytics_pdf(
        data,
        date_range_label=_date_range_label(days),
    )

    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    filename  = f"trustshare-file-analytics-{timestamp}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.get("/export/security")
def export_security_pdf(
    days: int = Query(30, ge=1, le=365),
    db:   Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download Security tab as PDF."""
    data = service.get_summary(db, days=days)
    pdf_bytes = generate_security_pdf(
        data,
        date_range_label=_date_range_label(days),
    )

    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    filename  = f"trustshare-security-{timestamp}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.get("/users", response_model=UserListResponse)
def users_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List of users for activity filter dropdown."""
    return {"users": service.get_users_list(db)}


@router.get("/system-stats", response_model=SystemStatsResponse)
def system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """System health + DB stats for admin monitoring."""
    return service.get_system_stats(db)