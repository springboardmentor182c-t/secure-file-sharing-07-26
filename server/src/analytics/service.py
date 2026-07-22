import uuid
from collections import OrderedDict
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from src.entities.access_log import AccessLog
from src.entities.file import File
from src.entities.shared_link import SharedLink
from src.shared_links.constants import LinkStatus
from src.analytics.models import (
    AnalyticsOverview,
    MonthlyActivityPoint,
    RecentActivityEntry,
    StatsSummary,
    TopFileEntry,
)


def get_stats(db: Session, owner_id: uuid.UUID) -> StatsSummary:
    base = db.query(SharedLink).filter(SharedLink.owner_id == owner_id)
    active = base.filter(SharedLink.status == LinkStatus.ACTIVE).count()

    totals = db.query(
        func.coalesce(func.sum(SharedLink.views), 0),
        func.coalesce(func.sum(SharedLink.downloads), 0),
    ).filter(SharedLink.owner_id == owner_id).first()
    total_views, total_downloads = totals if totals else (0, 0)

    soon_cutoff = datetime.utcnow() + timedelta(days=7)
    expiring_soon = base.filter(
        SharedLink.status == LinkStatus.ACTIVE,
        SharedLink.expires_at.isnot(None),
        SharedLink.expires_at <= soon_cutoff,
        SharedLink.expires_at >= datetime.utcnow(),
    ).count()

    file_stats = db.query(
        func.count(File.id),
        func.coalesce(func.sum(File.file_size), 0)
    ).filter(File.owner_id == owner_id).first()
    total_files, total_storage = file_stats if file_stats else (0, 0)

    return StatsSummary(
        active_links=active,
        total_views=int(total_views),
        total_downloads=int(total_downloads),
        expiring_soon=expiring_soon,
        total_files=int(total_files),
        total_storage_bytes=int(total_storage),
    )


def get_monthly_activity(db: Session, owner_id: uuid.UUID, months: int = 5) -> List[MonthlyActivityPoint]:
    links = db.query(SharedLink).filter(SharedLink.owner_id == owner_id).all()

    buckets: "OrderedDict[str, MonthlyActivityPoint]" = OrderedDict()
    for link in links:
        key = link.created_at.strftime("%Y-%m")
        label = link.created_at.strftime("%b")
        if key not in buckets:
            buckets[key] = MonthlyActivityPoint(label=label, created=0, access_events=0)
        buckets[key].created += 1
        buckets[key].access_events += link.views + link.downloads

    ordered_keys = sorted(buckets.keys())[-months:]
    if not ordered_keys:
        return [MonthlyActivityPoint(label=datetime.utcnow().strftime("%b"), created=0, access_events=0)]
    return [buckets[k] for k in ordered_keys]


def get_top_files(db: Session, owner_id: uuid.UUID, *, by: str, limit: int = 5) -> List[TopFileEntry]:
    metric_col = SharedLink.views if by == "views" else SharedLink.downloads
    rows = (
        db.query(File.id, File.file_name, func.sum(metric_col).label("total"))
        .join(SharedLink, SharedLink.file_id == File.id)
        .filter(SharedLink.owner_id == owner_id)
        .group_by(File.id, File.file_name)
        .order_by(func.sum(metric_col).desc())
        .limit(limit)
        .all()
    )
    return [TopFileEntry(file_id=r[0], file_name=r[1], value=int(r[2] or 0)) for r in rows]


def get_recent_activity(db: Session, owner_id: uuid.UUID, limit: int = 10) -> List[RecentActivityEntry]:
    rows = (
        db.query(AccessLog, File.file_name)
        .join(SharedLink, AccessLog.shared_link_id == SharedLink.id)
        .join(File, SharedLink.file_id == File.id)
        .filter(SharedLink.owner_id == owner_id)
        .order_by(AccessLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        RecentActivityEntry(
            shared_link_id=log.shared_link_id,
            file_name=file_name,
            action=log.action,
            success=log.success,
            created_at=log.created_at,
        )
        for log, file_name in rows
    ]


def get_analytics_overview(db: Session, owner_id: uuid.UUID) -> AnalyticsOverview:
    return AnalyticsOverview(
        stats=get_stats(db, owner_id),
        monthly_activity=get_monthly_activity(db, owner_id),
        most_viewed_files=get_top_files(db, owner_id, by="views"),
        most_downloaded_files=get_top_files(db, owner_id, by="downloads"),
        recent_activity=get_recent_activity(db, owner_id),
    )
