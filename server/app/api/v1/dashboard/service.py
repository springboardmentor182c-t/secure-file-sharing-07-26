from sqlalchemy.orm import Session

from app.api.v1.dashboard import schemas
from app.models.dashboard import (
    DashboardActivity,
    DashboardChart,
    DashboardNotification,
    DashboardProfile,
    DashboardRecentFile,
    DashboardSecurityStatus,
    DashboardSharedFileItem,
    DashboardSharedFilesSummary,
    DashboardStat,
    DashboardStorageBreakdown,
    DashboardStorageSummary,
    DashboardTeamActivity,
)


def _ordered(db: Session, model):
    return db.query(model).order_by(model.display_order.asc(), model.id.asc()).all()


def _seed_if_empty(db: Session, model, rows: list[dict]) -> None:
    if db.query(model).count() == 0:
        db.add_all(model(**row) for row in rows)


def seed_dashboard_data(db: Session) -> None:
    if db.query(DashboardProfile).count() == 0:
        db.add(
            DashboardProfile(
                name="Alex Kim",
                email="alex@acme.com",
                initials="AK",
                greeting="Welcome back, Alex",
                subtitle="Your secure workspace is healthy and up to date.",
                security_badge="Secure workspace active",
            )
        )

    _seed_if_empty(
        db,
        DashboardStat,
        [
            {"item_key": "total-files", "label": "Total Files", "value": "248", "trend": "+12 this week", "description": "24 files moved to vault", "icon": "file", "tone": "primary", "display_order": 1},
            {"item_key": "active-shares", "label": "Active Shares", "value": "46", "trend": "8 expire today", "description": "Across internal and client links", "icon": "share", "tone": "success", "display_order": 2},
            {"item_key": "pending-requests", "label": "Pending Requests", "value": "7", "trend": "3 need your action", "description": "Access reviews waiting", "icon": "clock", "tone": "warning", "display_order": 3},
            {"item_key": "security-alerts", "label": "Security Alerts", "value": "1", "trend": "Login from new location", "description": "No policy violations", "icon": "alert", "tone": "danger", "display_order": 4},
        ],
    )

    if db.query(DashboardStorageSummary).count() == 0:
        db.add(DashboardStorageSummary(used_label="68.4 GB", total_label="200 GB", percentage=34, plan_label="200 GB plan", free_label="131.6 GB free"))

    _seed_if_empty(
        db,
        DashboardStorageBreakdown,
        [
            {"item_key": "documents", "label": "Documents", "value_label": "38.2 GB", "percentage": 56, "color": "#315BFF", "color_class": "bg-[#315BFF]", "display_order": 1},
            {"item_key": "media", "label": "Media", "value_label": "18.7 GB", "percentage": 27, "color": "#8B5CF6", "color_class": "bg-[#8B5CF6]", "display_order": 2},
            {"item_key": "archives", "label": "Archives", "value_label": "8.9 GB", "percentage": 13, "color": "#FBBF24", "color_class": "bg-[#FBBF24]", "display_order": 3},
            {"item_key": "other", "label": "Other", "value_label": "2.6 GB", "percentage": 4, "color": "#2DD4BF", "color_class": "bg-[#2DD4BF]", "display_order": 4},
        ],
    )

    _seed_if_empty(
        db,
        DashboardRecentFile,
        [
            {"item_key": "file-1", "name": "Q4-2025-Financial-Report.pdf", "file_type": "PDF", "owner": "Alex Kim", "last_modified": "2 min ago", "size": "4.2 MB", "status": "Encrypted", "display_order": 1},
            {"item_key": "file-2", "name": "Product-Roadmap-2026.pdf", "file_type": "PDF", "owner": "Priya Nair", "last_modified": "1 hr ago", "size": "1.8 MB", "status": "Encrypted", "display_order": 2},
            {"item_key": "file-3", "name": "Brand-Assets-v3.zip", "file_type": "ZIP", "owner": "Sofia Reyes", "last_modified": "3 hrs ago", "size": "89.5 MB", "status": "Shared", "display_order": 3},
            {"item_key": "file-4", "name": "Homepage-Redesign-Mockup.png", "file_type": "PNG", "owner": "Design Team", "last_modified": "Yesterday", "size": "12.1 MB", "status": "Private", "display_order": 4},
            {"item_key": "file-5", "name": "Engineering-Onboarding.mp4", "file_type": "MP4", "owner": "Priya Nair", "last_modified": "2 days ago", "size": "234 MB", "status": "Shared", "display_order": 5},
            {"item_key": "file-6", "name": "Security-Policy-2026.pdf", "file_type": "PDF", "owner": "Alex Kim", "last_modified": "3 days ago", "size": "540 KB", "status": "Encrypted", "display_order": 6},
        ],
    )

    _seed_if_empty(
        db,
        DashboardActivity,
        [
            {"item_key": "activity-1", "activity_type": "share", "title": "Priya Nair shared Engineering-Onboarding.mp4", "actor": "Priya Nair", "initials": "PN", "file": "Engineering-Onboarding.mp4", "time": "2 min ago", "display_order": 1},
            {"item_key": "activity-2", "activity_type": "download", "title": "Marcus Wills downloaded Q4-2025-Financial-Report.pdf", "actor": "Marcus Wills", "initials": "MW", "file": "Q4-2025-Financial-Report.pdf", "time": "18 min ago", "display_order": 2},
            {"item_key": "activity-3", "activity_type": "upload", "title": "You uploaded Security-Policy-2026.pdf", "actor": "You", "initials": "AK", "file": "Security-Policy-2026.pdf", "time": "1 hr ago", "display_order": 3},
            {"item_key": "activity-4", "activity_type": "view", "title": "Jamie Lee viewed Product-Roadmap-2026.pdf", "actor": "Jamie Lee", "initials": "JL", "file": "Product-Roadmap-2026.pdf", "time": "2 hrs ago", "display_order": 4},
            {"item_key": "activity-5", "activity_type": "share", "title": "Sofia Reyes shared Brand-Assets-v3.zip", "actor": "Sofia Reyes", "initials": "SR", "file": "Brand-Assets-v3.zip", "time": "3 hrs ago", "display_order": 5},
        ],
    )

    _seed_if_empty(
        db,
        DashboardNotification,
        [
            {"item_key": "notification-1", "title": "File shared with you", "description": "Product-Roadmap-2026.pdf is ready", "time": "12 min ago", "notification_type": "share", "display_order": 1},
            {"item_key": "notification-2", "title": "Storage usage reached 34%", "description": "68.4 GB used of 200 GB", "time": "45 min ago", "notification_type": "info", "display_order": 2},
            {"item_key": "notification-3", "title": "Security scan completed", "description": "No policy violations found", "time": "2 hrs ago", "notification_type": "security", "display_order": 3},
        ],
    )

    _seed_if_empty(
        db,
        DashboardSecurityStatus,
        [
            {"item_key": "encryption", "label": "AES-256 Encryption", "value": "Enabled", "tone": "success", "display_order": 1},
            {"item_key": "mfa", "label": "2FA Enforced", "value": "Active", "tone": "success", "display_order": 2},
            {"item_key": "logging", "label": "Audit Logs Active", "value": "Running", "tone": "success", "display_order": 3},
        ],
    )

    _seed_if_empty(
        db,
        DashboardChart,
        [
            {"chart_type": "uploadTrend", "label": "Mon", "value": 12, "secondary_value": 8, "display_order": 1},
            {"chart_type": "uploadTrend", "label": "Tue", "value": 18, "secondary_value": 14, "display_order": 2},
            {"chart_type": "uploadTrend", "label": "Wed", "value": 15, "secondary_value": 10, "display_order": 3},
            {"chart_type": "uploadTrend", "label": "Thu", "value": 24, "secondary_value": 17, "display_order": 4},
            {"chart_type": "uploadTrend", "label": "Fri", "value": 22, "secondary_value": 16, "display_order": 5},
            {"chart_type": "uploadTrend", "label": "Sat", "value": 9, "secondary_value": 6, "display_order": 6},
            {"chart_type": "uploadTrend", "label": "Sun", "value": 14, "secondary_value": 9, "display_order": 7},
            {"chart_type": "fileTypes", "label": "Documents", "value": 56, "display_order": 1},
            {"chart_type": "fileTypes", "label": "Media", "value": 27, "display_order": 2},
            {"chart_type": "fileTypes", "label": "Archives", "value": 13, "display_order": 3},
            {"chart_type": "fileTypes", "label": "Other", "value": 4, "display_order": 4},
        ],
    )

    if db.query(DashboardSharedFilesSummary).count() == 0:
        db.add(DashboardSharedFilesSummary(total=46, active_links=46, expiring_soon=8, restricted_access=31))

    _seed_if_empty(
        db,
        DashboardSharedFileItem,
        [
            {"item_key": "shared-1", "label": "External links", "value": "18", "helper": "permission controlled", "display_order": 1},
            {"item_key": "shared-2", "label": "Team shares", "value": "28", "helper": "workspace members", "display_order": 2},
            {"item_key": "shared-3", "label": "Expiring today", "value": "8", "helper": "review required", "display_order": 3},
        ],
    )

    _seed_if_empty(
        db,
        DashboardTeamActivity,
        [
            {"item_key": "team-1", "name": "Priya Nair", "initials": "PN", "action": "shared", "file": "Engineering-Onboarding.mp4", "time": "2 min ago", "display_order": 1},
            {"item_key": "team-2", "name": "Marcus Wills", "initials": "MW", "action": "downloaded", "file": "Q4-2025-Financial-Report.pdf", "time": "18 min ago", "display_order": 2},
            {"item_key": "team-3", "name": "Sofia Reyes", "initials": "SR", "action": "shared", "file": "Brand-Assets-v3.zip", "time": "3 hrs ago", "display_order": 3},
        ],
    )

    db.commit()


def get_dashboard_summary(db: Session) -> schemas.DashboardSummaryResponse:
    profile = db.query(DashboardProfile).order_by(DashboardProfile.id.asc()).first()
    shared = db.query(DashboardSharedFilesSummary).order_by(DashboardSharedFilesSummary.id.asc()).first()
    if profile is None or shared is None:
        seed_dashboard_data(db)
        profile = db.query(DashboardProfile).order_by(DashboardProfile.id.asc()).first()
        shared = db.query(DashboardSharedFilesSummary).order_by(DashboardSharedFilesSummary.id.asc()).first()

    return schemas.DashboardSummaryResponse(
        user=schemas.DashboardUser(
            name=profile.name,
            email=profile.email,
            initials=profile.initials,
            greeting=profile.greeting,
            subtitle=profile.subtitle,
            securityBadge=profile.security_badge,
        ),
        stats=[
            schemas.DashboardStat(id=item.item_key, label=item.label, value=item.value, trend=item.trend, description=item.description, icon=item.icon, tone=item.tone)
            for item in _ordered(db, DashboardStat)
        ],
        sharedFiles=schemas.SharedFilesSummary(
            total=shared.total,
            activeLinks=shared.active_links,
            expiringSoon=shared.expiring_soon,
            restrictedAccess=shared.restricted_access,
            items=[
                schemas.SharedFileItem(id=item.item_key, label=item.label, value=item.value, helper=item.helper)
                for item in _ordered(db, DashboardSharedFileItem)
            ],
        ),
    )


def get_recent_files(db: Session) -> list[schemas.RecentFile]:
    return [
        schemas.RecentFile(id=item.item_key, name=item.name, type=item.file_type, owner=item.owner, lastModified=item.last_modified, size=item.size, status=item.status)
        for item in _ordered(db, DashboardRecentFile)
    ]


def get_recent_activity(db: Session) -> list[schemas.RecentActivity]:
    return [
        schemas.RecentActivity(id=item.item_key, type=item.activity_type, title=item.title, actor=item.actor, initials=item.initials, file=item.file, time=item.time)
        for item in _ordered(db, DashboardActivity)
    ]


def get_notifications(db: Session) -> list[schemas.NotificationPreview]:
    return [
        schemas.NotificationPreview(id=item.item_key, title=item.title, description=item.description, time=item.time, type=item.notification_type)
        for item in _ordered(db, DashboardNotification)
    ]


def get_storage(db: Session) -> schemas.DashboardStorage:
    storage = db.query(DashboardStorageSummary).order_by(DashboardStorageSummary.id.asc()).first()
    if storage is None:
        seed_dashboard_data(db)
        storage = db.query(DashboardStorageSummary).order_by(DashboardStorageSummary.id.asc()).first()

    return schemas.DashboardStorage(
        usedLabel=storage.used_label,
        totalLabel=storage.total_label,
        percentage=storage.percentage,
        planLabel=storage.plan_label,
        freeLabel=storage.free_label,
        breakdown=[
            schemas.StorageBreakdownItem(id=item.item_key, label=item.label, valueLabel=item.value_label, percentage=item.percentage, color=item.color, colorClass=item.color_class)
            for item in _ordered(db, DashboardStorageBreakdown)
        ],
    )


def get_security_status(db: Session) -> list[schemas.SecurityStatus]:
    return [schemas.SecurityStatus(id=item.item_key, label=item.label, value=item.value, tone=item.tone) for item in _ordered(db, DashboardSecurityStatus)]


def get_charts(db: Session) -> schemas.DashboardChartsResponse:
    upload_rows = db.query(DashboardChart).filter(DashboardChart.chart_type == "uploadTrend").order_by(DashboardChart.display_order.asc()).all()
    type_rows = db.query(DashboardChart).filter(DashboardChart.chart_type == "fileTypes").order_by(DashboardChart.display_order.asc()).all()
    return schemas.DashboardChartsResponse(
        uploadTrend=[schemas.UploadTrendPoint(day=item.label, uploads=item.value, shared=item.secondary_value or 0) for item in upload_rows],
        fileTypes=[schemas.FileTypePoint(name=item.label, value=item.value) for item in type_rows],
    )


def get_team_activity(db: Session) -> list[schemas.TeamActivity]:
    return [
        schemas.TeamActivity(id=item.item_key, name=item.name, initials=item.initials, action=item.action, file=item.file, time=item.time)
        for item in _ordered(db, DashboardTeamActivity)
    ]
