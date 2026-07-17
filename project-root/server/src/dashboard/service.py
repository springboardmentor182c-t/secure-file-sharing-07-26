from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from src.dashboard import models
from src.entities.file import File
from src.entities.notification import Notification
from src.entities.share_link import ShareLink
from src.entities.user import User


DEFAULT_STORAGE_QUOTA = 5_368_709_120
RECENT_FILE_LIMIT = 6
RECENT_NOTIFICATION_LIMIT = 4


def _get_upload_trend(
    db: Session,
    user_id: int,
    now: datetime,
) -> list[models.UploadTrend]:
    trend = []

    for days_ago in range(6, -1, -1):
        day = now - timedelta(days=days_ago)
        count = (
            db.query(File)
            .filter(
                File.owner_id == user_id,
                File.is_deleted.is_(False),
                func.date(File.created_at) == day.date(),
            )
            .count()
        )
        trend.append(models.UploadTrend(date=day.strftime("%a"), count=count))

    return trend


def _get_file_type_counts(db: Session, user_id: int) -> dict[str, int]:
    filenames = (
        db.query(File.original_name)
        .filter(File.owner_id == user_id, File.is_deleted.is_(False))
        .all()
    )
    counts: dict[str, int] = {}

    for (filename,) in filenames:
        file_type = filename.rsplit(".", 1)[-1].lower() if "." in filename else "other"
        counts[file_type] = counts.get(file_type, 0) + 1

    return counts


def get_dashboard_data(
    db: Session,
    current_user: User,
) -> models.DashboardResponse:
    user_id = current_user.id
    file_filter = (File.owner_id == user_id, File.is_deleted.is_(False))

    total_files = db.query(File).filter(*file_filter).count()
    recent_files = (
        db.query(File)
        .filter(*file_filter)
        .order_by(File.created_at.desc())
        .limit(RECENT_FILE_LIMIT)
        .all()
    )

    shares = db.query(ShareLink).filter(ShareLink.created_by == user_id).all()
    active_share_links = sum(1 for share in shares if share.is_active)
    total_share_views = sum(share.access_count or 0 for share in shares)

    notification_query = db.query(Notification).filter(Notification.user_id == user_id)
    total_notifications = notification_query.count()
    unread_notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        )
        .count()
    )
    recent_notifications = (
        notification_query.order_by(Notification.created_at.desc())
        .limit(RECENT_NOTIFICATION_LIMIT)
        .all()
    )

    used_bytes = current_user.storage_used or 0
    quota_bytes = current_user.storage_quota or DEFAULT_STORAGE_QUOTA
    storage = models.StorageStats(
        used_bytes=used_bytes,
        quota_bytes=quota_bytes,
        used_gb=round(used_bytes / 1_000_000_000, 2),
        quota_gb=round(quota_bytes / 1_000_000_000, 2),
        percent=round((used_bytes / quota_bytes) * 100, 1) if quota_bytes else 0,
    )

    analytics = models.DashboardAnalytics(
        total_files=total_files,
        total_share_links=len(shares),
        active_share_links=active_share_links,
        total_share_views=total_share_views,
        total_notifications=total_notifications,
        unread_notifications=unread_notifications,
        storage=storage,
        upload_trend=_get_upload_trend(db, user_id, datetime.now(timezone.utc)),
        top_file_types=_get_file_type_counts(db, user_id),
    )

    return models.DashboardResponse(
        analytics=analytics,
        files=[models.DashboardFile.model_validate(file) for file in recent_files],
        notifications=[
            models.DashboardNotification.model_validate(notification)
            for notification in recent_notifications
        ],
    )
