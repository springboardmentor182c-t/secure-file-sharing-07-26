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
import csv
import io
from fastapi.responses import StreamingResponse as CSVStreamingResponse


router = APIRouter()
service = AnalyticsService()


# ═══════════════════════════════════════════════════════════════════════════
# HELPERS — Date Range Handling
# ═══════════════════════════════════════════════════════════════════════════

def _date_range_label(days: int) -> str:
    """Format date range for PDF/CSV header."""
    if days == 7:
        return "Last 7 days"
    if days == 30:
        return "Last 30 days"
    if days == 90:
        return "Last 90 days"
    if days >= 365:              
        return "All Time"
    return f"Last {days} days"


def _custom_date_range_label(start_date: str | None, end_date: str | None) -> str | None:
    """Format custom date range for export header. Returns None if no custom range."""
    if not start_date or not end_date:
        return None
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        days = (end - start).days + 1
        return f"{start.strftime('%b %d, %Y')} → {end.strftime('%b %d, %Y')} ({days} days)"
    except (ValueError, TypeError):
        return None


def _resolve_days_from_custom(
    days: int, 
    start_date: str | None, 
    end_date: str | None
) -> int:
    """
    ✅ NEW: If custom dates provided, calculate actual days.
    Otherwise return the provided `days` value.
    """
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            actual_days = (end - start).days + 1
            return max(1, min(365, actual_days))
        except (ValueError, TypeError):
            return days
    return days


# ═══════════════════════════════════════════════════════════════════════════
# CORE ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/summary")
def summary(
    days: int = Query(30, ge=1, le=3650),
    start_date: str | None = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="Custom end date (YYYY-MM-DD)"),
    user_id: int | None = Query(None, description="Filter activity by user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full analytics + security summary with optional custom date range."""
    # ✅ Resolve custom dates to days
    actual_days = _resolve_days_from_custom(days, start_date, end_date)
    return service.get_summary(db, days=actual_days, user_id=user_id)


@router.get("/storage", response_model=StorageResponse)
def storage(
    days: int = Query(30, ge=1, le=3650),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_storage(db, days=days)


@router.get("/uploads", response_model=UploadAnalyticsResponse)
def uploads(
    days: int = Query(30, ge=1, le=3650),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_upload_analytics(db, days=days)


@router.get("/downloads", response_model=DownloadAnalyticsResponse)
def downloads(
    days: int = Query(30, ge=1, le=3650),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_download_analytics(db, days=days)


@router.get("/sharing", response_model=SharingAnalyticsResponse)
def sharing(
    days: int = Query(30, ge=1, le=3650),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_sharing_analytics(db, days=days)


@router.get("/security", response_model=SecurityAnalyticsResponse)
def security(
    days: int = Query(30, ge=1, le=3650),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_security_analytics(db, days=days)


@router.get("/recent-activity", response_model=RecentActivityResponse)
def recent_activity(
    days: int = Query(30, ge=1, le=3650),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"activities": service.get_recent_activity(db, days=days)}


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


@router.get("/trends")
def trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trend indicators for KPI cards + file access history."""
    return service.get_trend_indicators(db)


# ═══════════════════════════════════════════════════════════════════════════
# PDF EXPORT 
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/export/file-analytics")
def export_file_analytics_pdf(
    days: int = Query(30, ge=1, le=3650),
    start_date: str | None = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="Custom end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download File Analytics tab as PDF (respects date filter)."""
    #Resolve custom dates to actual days for filtering
    actual_days = _resolve_days_from_custom(days, start_date, end_date)
    
    # Fetch data using resolved days (now properly filtered)
    data = service.get_summary(db, days=actual_days)
    
    #Prefer custom label if custom range provided
    date_label = _custom_date_range_label(start_date, end_date) or _date_range_label(actual_days)
    
    pdf_bytes = generate_file_analytics_pdf(
        data,
        date_range_label=date_label,
    )

    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    filename = f"trustshare-file-analytics-{timestamp}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/security")
def export_security_pdf(
    days: int = Query(30, ge=1, le=3650),
    start_date: str | None = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="Custom end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download Security tab as PDF (respects date filter)."""
    # Resolve custom dates to actual days for filtering
    actual_days = _resolve_days_from_custom(days, start_date, end_date)
    
    data = service.get_summary(db, days=actual_days)
    date_label = _custom_date_range_label(start_date, end_date) or _date_range_label(actual_days)
    
    pdf_bytes = generate_security_pdf(
        data,
        date_range_label=date_label,
    )

    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    filename = f"trustshare-security-{timestamp}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ═══════════════════════════════════════════════════════════════════════════
# CSV EXPORT 
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/export/csv")
def export_csv(
    tab: str = Query("file", description="Tab type: 'file' or 'security'"),
    days: int = Query(30, ge=1, le=3650),
    start_date: str | None = Query(None, description="Custom start date (YYYY-MM-DD)"),
    end_date: str | None = Query(None, description="Custom end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download analytics data as CSV based on active tab (respects date filter)."""
    # Resolve custom dates to actual days for filtering
    actual_days = _resolve_days_from_custom(days, start_date, end_date)
    
    data = service.get_summary(db, days=actual_days)
    date_range_label = _custom_date_range_label(start_date, end_date) or _date_range_label(actual_days)
    
    output = io.StringIO()
    writer = csv.writer(output)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")

    # ═══════════════════════════════════════════════════════
    # SECURITY TAB CSV — with report metadata header
    # ═══════════════════════════════════════════════════════
    if tab == "security":
        security = data.get("security", {}) or {}

        # Report Header (NEW - metadata section)
        writer.writerow(["TrustShare Security Report"])
        writer.writerow(["Generated", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow(["Date Range", date_range_label])
        writer.writerow([])

        # Section 1: Security KPIs
        writer.writerow(["=== SECURITY OVERVIEW ==="])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Successful Logins", security.get("login_events", 0)])
        writer.writerow(["Failed Attempts", security.get("failed_logins", 0)])
        writer.writerow(["Blocked Attacks", security.get("blocked_attacks", 0)])
        writer.writerow(["Security Events", security.get("security_events", 0)])
        writer.writerow([])

        # Section 2: Security Score (if available)
        sec_score = data.get("security_score", {}) or {}
        if sec_score:
            writer.writerow(["=== SECURITY SCORE ==="])
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Overall Score", f"{sec_score.get('score', 0)}/100"])
            writer.writerow(["Status", sec_score.get("status", "N/A")])
            writer.writerow(["Total Logins", sec_score.get("total_logins", 0)])
            writer.writerow(["Successful", sec_score.get("successful", 0)])
            writer.writerow(["Failed", sec_score.get("failed", 0)])
            writer.writerow(["Blocked Attacks", sec_score.get("blocked_attacks", 0)])
            
            breakdown = sec_score.get("breakdown", {}) or {}
            if breakdown:
                writer.writerow(["Login Success Score", f"{breakdown.get('login_success', 0)}/100"])
                writer.writerow(["Attack Response Score", f"{breakdown.get('attack_response', 0)}/100"])
                writer.writerow(["Failed Login Score", f"{breakdown.get('failed_score', 0)}/100"])
            writer.writerow([])

        # Section 3: MFA Adoption
        mfa = data.get("mfa_adoption", {}) or {}
        if mfa:
            writer.writerow(["=== MFA ADOPTION ==="])
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Total Users", mfa.get("total_users", 0)])
            writer.writerow(["MFA Enabled", mfa.get("mfa_enabled", 0)])
            writer.writerow(["MFA Disabled", mfa.get("mfa_disabled", 0)])
            writer.writerow(["Adoption Rate", f"{mfa.get('adoption_pct', 0)}%"])
            writer.writerow(["Status", mfa.get("status", "N/A")])
            writer.writerow([])

        # Section 4: Login Activity
        writer.writerow(["=== LOGIN ACTIVITY ==="])
        writer.writerow(["Date", "Successful", "Failed"])
        for activity in (security.get("login_activity") or []):
            writer.writerow([
                activity.get("date", ""),
                activity.get("success", 0),
                activity.get("failed", 0),
            ])
        writer.writerow([])

        # Section 5: Security Events Timeline
        writer.writerow(["=== SECURITY EVENT TIMELINE ==="])
        writer.writerow(["Severity", "Event", "Detail", "Time"])
        for event in (security.get("events") or []):
            writer.writerow([
                str(event.get("sev", "")).upper(),
                event.get("label", ""),
                event.get("detail", ""),
                event.get("time", ""),
            ])
        writer.writerow([])

        # Section 6: Unauthorized Attempts
        writer.writerow(["=== UNAUTHORIZED ACCESS ATTEMPTS ==="])
        writer.writerow(["IP Address", "Location", "Target", "Attempts", "When", "Status"])
        for attempt in (security.get("unauthorized_attempts") or []):
            writer.writerow([
                attempt.get("ip", ""),
                attempt.get("location", ""),
                str(attempt.get("target", "")),
                attempt.get("attempts", 0),
                attempt.get("time", ""),
                "Blocked" if attempt.get("blocked") else "Flagged",
            ])
        writer.writerow([])

        # Section 7: Recent Activity (NOW in Security tab too!)
        writer.writerow(["=== RECENT ACTIVITY ==="])
        writer.writerow(["Event", "User", "File", "Time"])
        recent_data = data.get("recent_activity", {}) or {}
        activities = recent_data.get("activities") or []
        for activity in activities[:50]:
            if isinstance(activity, dict):
                writer.writerow([
                    activity.get("event_type", "") or activity.get("action", ""),
                    activity.get("user", ""),
                    activity.get("file", ""),
                    str(activity.get("time", "") or activity.get("date", "")),
                ])
            else:
                writer.writerow([
                    getattr(activity, "event_type", "") or getattr(activity, "action", ""),
                    getattr(activity, "user", ""),
                    getattr(activity, "file", ""),
                    str(getattr(activity, "time", "") or getattr(activity, "date", "")),
                ])

        # Enhanced filename with date range
        date_slug = date_range_label.replace(" ", "-").replace("→", "to").replace(",", "").replace("(", "").replace(")", "").replace("/", "-")[:40]
        filename = f"trustshare-security-report-{timestamp}.csv"

    # ═══════════════════════════════════════════════════════
    # FILE ANALYTICS TAB CSV — with report metadata
    # ═══════════════════════════════════════════════════════
    else:
        storage = data.get("storage", {}) or {}
        uploads_data = data.get("uploads", {}) or {}
        downloads_data = data.get("downloads", {}) or {}
        sharing_data = data.get("sharing", {}) or {}
        deletes_data = data.get("deletes", {}) or {}

        # Report Header (NEW - metadata section)
        writer.writerow(["TrustShare File Analytics Report"])
        writer.writerow(["Generated", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow(["Date Range", date_range_label])
        writer.writerow([])

        # Section 1: File KPIs
        writer.writerow(["=== FILE ANALYTICS OVERVIEW ==="])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Storage Used", f"{storage.get('storage_used_gb', 0):.2f} GB"])
        writer.writerow(["Storage Quota", f"{storage.get('storage_quota_gb', 0)} GB"])
        writer.writerow(["Storage Percentage", f"{storage.get('storage_percentage', 0)}%"])
        writer.writerow(["Files Uploaded (in period)", uploads_data.get("total_uploads", 0)])
        writer.writerow(["Uploads Today", uploads_data.get("today_uploads", 0)])
        writer.writerow(["Total Downloads (in period)", downloads_data.get("total_downloads", 0)])
        writer.writerow(["Data Transferred (MB)", f"{downloads_data.get('transferred_mb', 0):.2f}"])
        writer.writerow(["Active Shares", sharing_data.get("active_links", 0)])
        writer.writerow(["Total Shares (in period)", sharing_data.get("total_links", 0)])
        writer.writerow(["New Shares This Week", sharing_data.get("new_this_week", 0)])
        writer.writerow(["Files Deleted (in period)", deletes_data.get("total_deletes", 0)])
        writer.writerow(["Deleted This Week", deletes_data.get("this_week_deletes", 0)])
        writer.writerow([])

        # Section 2: File Type Distribution (NEW!)
        file_types = data.get("file_types", []) or []
        if file_types:
            writer.writerow(["=== FILE TYPE DISTRIBUTION ==="])
            writer.writerow(["Type", "Count", "Total Size (MB)"])
            for ft in file_types:
                writer.writerow([
                    ft.get("type", ""),
                    ft.get("count", 0),
                    ft.get("size_mb", 0),
                ])
            writer.writerow([])

        # Section 3: Top Active Users (NEW!)
        top_users = data.get("top_active_users", []) or []
        if top_users:
            writer.writerow(["=== TOP ACTIVE USERS ==="])
            writer.writerow(["Rank", "Name", "Email", "Activity Count"])
            for u in top_users:
                writer.writerow([
                    u.get("rank", ""),
                    u.get("name", ""),
                    u.get("email", ""),
                    u.get("activity", 0),
                ])
            writer.writerow([])

        # Section 4: Storage Usage Over Time
        writer.writerow(["=== STORAGE USAGE OVER TIME ==="])
        writer.writerow(["Period", "Storage (GB)"])
        for point in (storage.get("trend") or []):
            writer.writerow([
                point.get("month", ""),
                f"{point.get('gb', 0):.4f}",
            ])
        writer.writerow([])

        # Section 5: Upload/Download Weekly Volume
        writer.writerow(["=== UPLOAD / DOWNLOAD VOLUME ==="])
        writer.writerow(["Week Starting", "Uploads", "Downloads"])
        for vol in (uploads_data.get("volume_weekly") or []):
            writer.writerow([
                vol.get("week", ""),
                vol.get("uploads", 0),
                vol.get("downloads", 0),
            ])
        writer.writerow([])

        # Section 6: Top Shared Files
        writer.writerow(["=== TOP SHARED FILES ==="])
        writer.writerow(["Rank", "File Name", "Opens", "Downloads"])
        for file in (sharing_data.get("top_files") or []):
            writer.writerow([
                file.get("rank", ""),
                file.get("name", ""),
                file.get("opens", 0),
                file.get("downloads", 0),
            ])
        writer.writerow([])

        # Section 7: Sharing by Department
        writer.writerow(["=== SHARING BY DEPARTMENT ==="])
        writer.writerow(["Department", "Share of Activity (%)"])
        for dept in (sharing_data.get("by_department") or []):
            writer.writerow([
                dept.get("name", ""),
                dept.get("value", 0),
            ])
        writer.writerow([])

        # Section 8: Recent Activity
        writer.writerow(["=== RECENT ACTIVITY ==="])
        writer.writerow(["Event", "User", "File", "Time"])
        recent_data = data.get("recent_activity", {}) or {}
        activities = recent_data.get("activities") or []
        for activity in activities[:50]:
            if isinstance(activity, dict):
                writer.writerow([
                    activity.get("event_type", "") or activity.get("action", ""),
                    activity.get("user", ""),
                    activity.get("file", ""),
                    str(activity.get("time", "") or activity.get("date", "")),
                ])
            else:
                writer.writerow([
                    getattr(activity, "event_type", "") or getattr(activity, "action", ""),
                    getattr(activity, "user", ""),
                    getattr(activity, "file", ""),
                    str(getattr(activity, "time", "") or getattr(activity, "date", "")),
                ])

        filename = f"trustshare-file-analytics-{timestamp}.csv"

    output.seek(0)

    return CSVStreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )