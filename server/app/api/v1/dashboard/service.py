from sqlalchemy.orm import Session

from app.api.v1.dashboard import schemas
from app.models.dashboard import (
    DashboardActivity,
    DashboardFileTypeDistribution,
    DashboardNotification,
    DashboardRecentFile,
    DashboardSecurityStatus,
    DashboardSharedFileItem,
    DashboardSharedFilesSummary,
    DashboardStat,
    DashboardStorageBreakdown,
    DashboardStorageSummary,
    DashboardTeamActivity,
    DashboardUploadTrend,
    DashboardUserSummary,
)


def _ordered(db: Session, model):
    return db.query(model).order_by(model.display_order.asc(), model.id.asc()).all()


def _seed_if_empty(db: Session, model, rows: list[dict]) -> None:
    if db.query(model).count() == 0:
        db.add_all(model(**row) for row in rows)


def seed_dashboard_data(db: Session) -> None:
    if db.query(DashboardUserSummary).count() == 0:
        db.add(
            DashboardUserSummary(
                name="Abhishek",
                greeting="Good Morning",
                subtitle="Here's what's happening with your secure files today.",
                security_badge="Secure workspace active",
            )
        )

    _seed_if_empty(
        db,
        DashboardStat,
        [
            {
                "item_key": "total-files",
                "label": "Total Files",
                "value": "1,248",
                "trend": "+12%",
                "description": "from last month",
                "icon": "files",
                "tone": "primary",
                "display_order": 1,
            },
            {
                "item_key": "shared-files",
                "label": "Shared Files",
                "value": "342",
                "trend": "+8%",
                "description": "active collaboration files",
                "icon": "share",
                "tone": "info",
                "display_order": 2,
            },
            {
                "item_key": "storage-used",
                "label": "Storage Used",
                "value": "72 GB",
                "trend": "72%",
                "description": "of 100 GB allocated",
                "icon": "storage",
                "tone": "warning",
                "display_order": 3,
            },
            {
                "item_key": "active-shares",
                "label": "Active Shares",
                "value": "89",
                "trend": "+5",
                "description": "secure links live now",
                "icon": "active",
                "tone": "success",
                "display_order": 4,
            },
            {
                "item_key": "pending-requests",
                "label": "Pending Requests",
                "value": "14",
                "trend": "-3",
                "description": "awaiting review",
                "icon": "requests",
                "tone": "warning",
                "display_order": 5,
            },
            {
                "item_key": "security-score",
                "label": "Security Score",
                "value": "98%",
                "trend": "+2%",
                "description": "workspace health score",
                "icon": "shield",
                "tone": "success",
                "display_order": 6,
            },
        ],
    )

    if db.query(DashboardStorageSummary).count() == 0:
        db.add(DashboardStorageSummary(used_label="72 GB", total_label="100 GB", percentage=72))

    _seed_if_empty(
        db,
        DashboardStorageBreakdown,
        [
            {
                "item_key": "documents",
                "label": "Documents",
                "value_label": "38 GB",
                "percentage": 38,
                "color_class": "bg-[#4F46E5]",
                "display_order": 1,
            },
            {
                "item_key": "images",
                "label": "Images",
                "value_label": "18 GB",
                "percentage": 18,
                "color_class": "bg-[#2563EB]",
                "display_order": 2,
            },
            {
                "item_key": "videos",
                "label": "Videos",
                "value_label": "11 GB",
                "percentage": 11,
                "color_class": "bg-[#F59E0B]",
                "display_order": 3,
            },
            {
                "item_key": "others",
                "label": "Others",
                "value_label": "5 GB",
                "percentage": 5,
                "color_class": "bg-[#64748B]",
                "display_order": 4,
            },
        ],
    )

    _seed_if_empty(
        db,
        DashboardRecentFile,
        [
            {
                "item_key": "file-1",
                "name": "Project_Report.pdf",
                "file_type": "PDF",
                "owner": "Abhishek",
                "last_modified": "Today, 9:42 AM",
                "size": "8.4 MB",
                "status": "Encrypted",
                "display_order": 1,
            },
            {
                "item_key": "file-2",
                "name": "Client_Agreement.docx",
                "file_type": "DOCX",
                "owner": "Sara",
                "last_modified": "Today, 8:15 AM",
                "size": "2.1 MB",
                "status": "Shared",
                "display_order": 2,
            },
            {
                "item_key": "file-3",
                "name": "Financial_Data.xlsx",
                "file_type": "XLSX",
                "owner": "Finance Team",
                "last_modified": "Yesterday, 5:18 PM",
                "size": "4.8 MB",
                "status": "Encrypted",
                "display_order": 3,
            },
            {
                "item_key": "file-4",
                "name": "UI_Design.fig",
                "file_type": "FIG",
                "owner": "Design Team",
                "last_modified": "Yesterday, 2:06 PM",
                "size": "15.7 MB",
                "status": "Shared",
                "display_order": 4,
            },
            {
                "item_key": "file-5",
                "name": "Research_Notes.pdf",
                "file_type": "PDF",
                "owner": "Abhishek",
                "last_modified": "Jul 6, 2026",
                "size": "6.2 MB",
                "status": "Pending Review",
                "display_order": 5,
            },
        ],
    )

    _seed_if_empty(
        db,
        DashboardActivity,
        [
            {"item_key": "activity-1", "activity_type": "upload", "title": "Abhishek uploaded Project_Report.pdf", "time": "6 minutes ago", "display_order": 1},
            {"item_key": "activity-2", "activity_type": "share", "title": "Sara shared Client_Agreement.docx", "time": "28 minutes ago", "display_order": 2},
            {"item_key": "activity-3", "activity_type": "security", "title": "System encrypted Financial_Data.xlsx", "time": "1 hour ago", "display_order": 3},
            {"item_key": "activity-4", "activity_type": "admin", "title": "Admin updated access permissions", "time": "2 hours ago", "display_order": 4},
            {"item_key": "activity-5", "activity_type": "expired", "title": "Temporary link expired", "time": "3 hours ago", "display_order": 5},
        ],
    )

    _seed_if_empty(
        db,
        DashboardSecurityStatus,
        [
            {"item_key": "encryption", "label": "AES-256 Encryption", "value": "Enabled", "tone": "success", "display_order": 1},

{"item_key": "key-management", "label": "Key Management", "value": "Rotated Successfully", "tone": "success", "display_order": 2},

{"item_key": "file-integrity", "label": "File Integrity", "value": "Verified", "tone": "success", "display_order": 3},

{"item_key": "access-control", "label": "Role-Based Access", "value": "Protected", "tone": "success", "display_order": 4},

{"item_key": "audit", "label": "Security Audit Logs", "value": "Recording", "tone": "success", "display_order": 5},

        ],
        
    )

    _seed_if_empty(
        db,
        DashboardNotification,
        [
            {"item_key": "notification-1", "title": "File shared with you", "description": "Sara shared Client_Agreement.docx", "time": "12 min ago", "notification_type": "share", "display_order": 1},
            {"item_key": "notification-2", "title": "Storage usage reached 72%", "description": "Review large files to free space", "time": "45 min ago", "notification_type": "warning", "display_order": 2},
            {"item_key": "notification-3", "title": "Temporary link expires soon", "description": "Research_Notes.pdf expires today", "time": "1 hr ago", "notification_type": "info", "display_order": 3},
            {"item_key": "notification-4", "title": "Security scan completed", "description": "No threats were detected", "time": "2 hrs ago", "notification_type": "security", "display_order": 4},
        ],
    )

    _seed_if_empty(
        db,
        DashboardUploadTrend,
        [
            {"day": "Mon", "uploads": 18, "shared": 12, "display_order": 1},
            {"day": "Tue", "uploads": 24, "shared": 15, "display_order": 2},
            {"day": "Wed", "uploads": 19, "shared": 14, "display_order": 3},
            {"day": "Thu", "uploads": 32, "shared": 21, "display_order": 4},
            {"day": "Fri", "uploads": 28, "shared": 18, "display_order": 5},
            {"day": "Sat", "uploads": 16, "shared": 9, "display_order": 6},
            {"day": "Sun", "uploads": 22, "shared": 13, "display_order": 7},
        ],
    )

    _seed_if_empty(
        db,
        DashboardFileTypeDistribution,
        [
            {"name": "Documents", "value": 46, "display_order": 1},
            {"name": "Images", "value": 22, "display_order": 2},
            {"name": "Spreadsheets", "value": 15, "display_order": 3},
            {"name": "Designs", "value": 10, "display_order": 4},
            {"name": "Others", "value": 7, "display_order": 5},
        ],
    )

    if db.query(DashboardSharedFilesSummary).count() == 0:
        db.add(DashboardSharedFilesSummary(total=342, active_links=89, expiring_soon=7, restricted_access=63))

    _seed_if_empty(
        db,
        DashboardSharedFileItem,
        [
            {"item_key": "shared-1", "label": "Team shared files", "value": "188", "helper": "internal workspace", "display_order": 1},
            {"item_key": "shared-2", "label": "External client links", "value": "91", "helper": "permission controlled", "display_order": 2},
            {"item_key": "shared-3", "label": "Expiring links", "value": "7", "helper": "within 24 hours", "display_order": 3},
        ],
    )

    _seed_if_empty(
        db,
        DashboardTeamActivity,
        [
            {"item_key": "team-1", "name": "Sara Khan", "initials": "SK", "action": "shared", "file": "Client_Agreement.docx", "time": "28 min ago", "display_order": 1},
            {"item_key": "team-2", "name": "Rahul Mehta", "initials": "RM", "action": "reviewed", "file": "Financial_Data.xlsx", "time": "1 hr ago", "display_order": 2},
            {"item_key": "team-3", "name": "Priya Shah", "initials": "PS", "action": "commented on", "file": "UI_Design.fig", "time": "2 hrs ago", "display_order": 3},
            {"item_key": "team-4", "name": "Admin", "initials": "AD", "action": "updated access for", "file": "Research_Notes.pdf", "time": "3 hrs ago", "display_order": 4},
        ],
    )

    db.commit()


def get_dashboard_summary(db: Session) -> schemas.DashboardSummaryResponse:
    user = db.query(DashboardUserSummary).order_by(DashboardUserSummary.id.asc()).first()
    shared_summary = db.query(DashboardSharedFilesSummary).order_by(DashboardSharedFilesSummary.id.asc()).first()
    shared_items = _ordered(db, DashboardSharedFileItem)

    if user is None or shared_summary is None:
        seed_dashboard_data(db)
        user = db.query(DashboardUserSummary).order_by(DashboardUserSummary.id.asc()).first()
        shared_summary = db.query(DashboardSharedFilesSummary).order_by(DashboardSharedFilesSummary.id.asc()).first()
        shared_items = _ordered(db, DashboardSharedFileItem)

    return schemas.DashboardSummaryResponse(
        user=schemas.DashboardUser(
            name=user.name,
            greeting=user.greeting,
            subtitle=user.subtitle,
            securityBadge=user.security_badge,
        ),
        stats=[
            schemas.DashboardStat(
                id=stat.item_key,
                label=stat.label,
                value=stat.value,
                trend=stat.trend,
                description=stat.description,
                icon=stat.icon,
                tone=stat.tone,
            )
            for stat in _ordered(db, DashboardStat)
        ],
        sharedFiles=schemas.SharedFilesSummary(
            total=shared_summary.total,
            activeLinks=shared_summary.active_links,
            expiringSoon=shared_summary.expiring_soon,
            restrictedAccess=shared_summary.restricted_access,
            items=[
                schemas.SharedFileItem(id=item.item_key, label=item.label, value=item.value, helper=item.helper)
                for item in shared_items
            ],
        ),
    )


def get_recent_files(db: Session) -> list[schemas.RecentFile]:
    return [
        schemas.RecentFile(
            id=file.item_key,
            name=file.name,
            type=file.file_type,
            owner=file.owner,
            lastModified=file.last_modified,
            size=file.size,
            status=file.status,
        )
        for file in _ordered(db, DashboardRecentFile)
    ]


def get_recent_activity(db: Session) -> list[schemas.RecentActivity]:
    return [
        schemas.RecentActivity(id=activity.item_key, type=activity.activity_type, title=activity.title, time=activity.time)
        for activity in _ordered(db, DashboardActivity)
    ]


def get_notifications(db: Session) -> list[schemas.NotificationPreview]:
    return [
        schemas.NotificationPreview(
            id=notification.item_key,
            title=notification.title,
            description=notification.description,
            time=notification.time,
            type=notification.notification_type,
        )
        for notification in _ordered(db, DashboardNotification)
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
        breakdown=[
            schemas.StorageBreakdownItem(
                id=item.item_key,
                label=item.label,
                valueLabel=item.value_label,
                percentage=item.percentage,
                colorClass=item.color_class,
            )
            for item in _ordered(db, DashboardStorageBreakdown)
        ],
    )


def get_security_status(db: Session) -> list[schemas.SecurityStatus]:
    return [
        schemas.SecurityStatus(id=item.item_key, label=item.label, value=item.value, tone=item.tone)
        for item in _ordered(db, DashboardSecurityStatus)
    ]


def get_charts(db: Session) -> schemas.DashboardChartsResponse:
    return schemas.DashboardChartsResponse(
        uploadTrend=[
            schemas.UploadTrendPoint(day=item.day, uploads=item.uploads, shared=item.shared)
            for item in _ordered(db, DashboardUploadTrend)
        ],
        fileTypes=[
            schemas.FileTypePoint(name=item.name, value=item.value)
            for item in _ordered(db, DashboardFileTypeDistribution)
        ],
    )


def get_team_activity(db: Session) -> list[schemas.TeamActivity]:
    return [
        schemas.TeamActivity(
            id=item.item_key,
            name=item.name,
            initials=item.initials,
            action=item.action,
            file=item.file,
            time=item.time,
        )
        for item in _ordered(db, DashboardTeamActivity)
    ]
