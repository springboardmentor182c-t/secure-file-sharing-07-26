"""
Business logic for the Shared Links module.

Following this project's existing convention (see how `todos`/`users`/`auth`
are laid out), there's no separate repository layer — service functions take
a `db: Session` and query directly. Route handlers in `controller.py` stay
thin: validate input, call a service function, return a response.
"""
import uuid
from collections import OrderedDict
from datetime import datetime, timedelta
from typing import Optional, Sequence, Tuple

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, selectinload

from src.entities.access_log import AccessLog
from src.entities.file import File
from src.entities.shared_link import SharedLink
from src.exceptions import (
    DownloadNotAllowedError,
    InvalidPasswordError,
    LinkExpiredError,
    LinkUnavailableError,
    NotFoundError,
    PasswordRequiredError,
    PermissionDeniedError,
)
from src.shared_links.constants import LinkPermission, LinkStatus, SortField
from src.shared_links.models import (
    AnalyticsOverview,
    MonthlyActivityPoint,
    RecentActivityEntry,
    SharedLinkCreate,
    SharedLinkUpdate,
    StatsSummary,
    TopFileEntry,
)
from src.shared_links.utils import hash_password, is_expired, verify_password

# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------


def create_link(db: Session, *, owner_id: uuid.UUID, data: SharedLinkCreate) -> SharedLink:
    file_obj = db.get(File, data.file_id)
    if file_obj is None:
        raise NotFoundError(f"File {data.file_id} not found")
    if file_obj.owner_id != owner_id:
        raise PermissionDeniedError("You do not own this file")

    link = SharedLink(
        id=uuid.uuid4(),
        owner_id=owner_id,
        file_id=data.file_id,
        permission=data.permission,
        status=LinkStatus.ACTIVE,
        password_hash=hash_password(data.password) if data.password else None,
        password_protected=bool(data.password),
        allow_download=data.allow_download or data.permission == LinkPermission.DOWNLOAD,
        recipient_email=data.recipient_email,
        expires_at=data.expires_at,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def get_owned_link(db: Session, *, link_id: uuid.UUID, owner_id: uuid.UUID) -> SharedLink:
    link = (
        db.query(SharedLink)
        .options(selectinload(SharedLink.file))
        .filter(SharedLink.id == link_id)
        .first()
    )
    if link is None or link.owner_id != owner_id:
        raise NotFoundError(f"Shared link {link_id} not found")
    return link


def search_links(
    db: Session,
    *,
    owner_id: uuid.UUID,
    search: Optional[str],
    status: Optional[LinkStatus],
    permission: Optional[LinkPermission],
    expiring_within_days: Optional[int],
    sort_by: SortField,
    page: int,
    page_size: int,
) -> Tuple[Sequence[SharedLink], int]:
    query = (
        db.query(SharedLink)
        .options(selectinload(SharedLink.file))
        .filter(SharedLink.owner_id == owner_id)
    )

    if search:
        like = f"%{search.strip()}%"
        query = query.join(File, SharedLink.file_id == File.id).filter(
            or_(File.original_filename.ilike(like), SharedLink.recipient_email.ilike(like))
        )
    if status is not None:
        query = query.filter(SharedLink.status == status)
    if permission is not None:
        query = query.filter(SharedLink.permission == permission)
    if expiring_within_days is not None:
        cutoff = datetime.utcnow() + timedelta(days=expiring_within_days)
        query = query.filter(SharedLink.expires_at.isnot(None), SharedLink.expires_at <= cutoff)

    total = query.with_entities(func.count(func.distinct(SharedLink.id))).scalar() or 0

    sort_map = {
        SortField.NEWEST: SharedLink.created_at.desc(),
        SortField.OLDEST: SharedLink.created_at.asc(),
        SortField.VIEWS: SharedLink.views.desc(),
        SortField.DOWNLOADS: SharedLink.downloads.desc(),
        SortField.EXPIRATION: SharedLink.expires_at.asc().nullslast(),
    }
    if sort_by == SortField.ALPHABETICAL:
        query = query.join(File, SharedLink.file_id == File.id).order_by(File.original_filename.asc())
    else:
        query = query.order_by(sort_map.get(sort_by, SharedLink.created_at.desc()))

    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def update_link(db: Session, *, link_id: uuid.UUID, owner_id: uuid.UUID, data: SharedLinkUpdate) -> SharedLink:
    link = get_owned_link(db, link_id=link_id, owner_id=owner_id)

    if data.permission is not None:
        link.permission = data.permission
    if data.expires_at is not None:
        link.expires_at = data.expires_at
    if data.allow_download is not None:
        link.allow_download = data.allow_download

    if data.remove_password:
        link.password_hash = None
        link.password_protected = False
    elif data.password:
        link.password_hash = hash_password(data.password)
        link.password_protected = True

    # Editing a link's expiry is also how an owner "reactivates" an expired one.
    if link.status == LinkStatus.EXPIRED and data.expires_at is not None:
        link.status = LinkStatus.ACTIVE
        link.expiry_warning_sent = False
        link.expired_notice_sent = False

    db.commit()
    db.refresh(link)
    return link


def set_status(db: Session, *, link_id: uuid.UUID, owner_id: uuid.UUID, status: LinkStatus) -> SharedLink:
    link = get_owned_link(db, link_id=link_id, owner_id=owner_id)
    link.status = status
    db.commit()
    db.refresh(link)
    return link


def toggle_enabled(db: Session, *, link_id: uuid.UUID, owner_id: uuid.UUID) -> SharedLink:
    link = get_owned_link(db, link_id=link_id, owner_id=owner_id)
    link.status = LinkStatus.ACTIVE if link.status == LinkStatus.DISABLED else LinkStatus.DISABLED
    db.commit()
    db.refresh(link)
    return link


def revoke_link(db: Session, *, link_id: uuid.UUID, owner_id: uuid.UUID) -> SharedLink:
    return set_status(db, link_id=link_id, owner_id=owner_id, status=LinkStatus.REVOKED)


def delete_link(db: Session, *, link_id: uuid.UUID, owner_id: uuid.UUID) -> None:
    link = get_owned_link(db, link_id=link_id, owner_id=owner_id)
    db.delete(link)
    db.commit()


# ---------------------------------------------------------------------------
# Public access flow
# ---------------------------------------------------------------------------


def _assert_accessible(link: SharedLink) -> None:
    if link.status == LinkStatus.REVOKED:
        raise LinkUnavailableError("This link has been revoked by its owner")
    if link.status == LinkStatus.DISABLED:
        raise LinkUnavailableError("This link is currently disabled")
    if link.status == LinkStatus.EXPIRED or is_expired(link.expires_at):
        raise LinkExpiredError("This link has expired")


def _log_access(
    db: Session, *, shared_link_id: uuid.UUID, action: str, success: bool,
    reason: Optional[str] = None, ip_address: Optional[str] = None, user_agent: Optional[str] = None,
) -> None:
    db.add(
        AccessLog(
            shared_link_id=shared_link_id, action=action, success=success, reason=reason,
            ip_address=ip_address, user_agent=user_agent,
        )
    )
    db.commit()


def access_link(
    db: Session, *, link_id: uuid.UUID, password: Optional[str],
    ip_address: Optional[str], user_agent: Optional[str],
) -> SharedLink:
    link = db.query(SharedLink).options(selectinload(SharedLink.file)).filter(SharedLink.id == link_id).first()
    if link is None:
        raise NotFoundError("This link does not exist")

    try:
        _assert_accessible(link)
        if link.password_protected:
            if not password:
                raise PasswordRequiredError("This link is password protected")
            if not verify_password(password, link.password_hash):
                raise InvalidPasswordError("Incorrect password")
    except Exception as exc:
        _log_access(db, shared_link_id=link.id, action="view", success=False, reason=str(exc),
                    ip_address=ip_address, user_agent=user_agent)
        raise

    link.views += 1
    db.commit()
    db.refresh(link)
    _log_access(db, shared_link_id=link.id, action="view", success=True,
                ip_address=ip_address, user_agent=user_agent)
    return link


def download_link(
    db: Session, *, link_id: uuid.UUID, password: Optional[str],
    ip_address: Optional[str], user_agent: Optional[str],
) -> SharedLink:
    link = db.query(SharedLink).options(selectinload(SharedLink.file)).filter(SharedLink.id == link_id).first()
    if link is None:
        raise NotFoundError("This link does not exist")

    try:
        _assert_accessible(link)
        if link.password_protected:
            if not password:
                raise PasswordRequiredError("This link is password protected")
            if not verify_password(password, link.password_hash):
                raise InvalidPasswordError("Incorrect password")
        if not link.allow_download or link.permission == LinkPermission.VIEW:
            raise DownloadNotAllowedError("This link does not permit downloads")
    except Exception as exc:
        _log_access(db, shared_link_id=link.id, action="download", success=False, reason=str(exc),
                    ip_address=ip_address, user_agent=user_agent)
        raise

    link.downloads += 1
    db.commit()
    db.refresh(link)
    _log_access(db, shared_link_id=link.id, action="download", success=True,
                ip_address=ip_address, user_agent=user_agent)
    return link


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------


def get_stats(db: Session, owner_id: uuid.UUID) -> StatsSummary:
    base = db.query(SharedLink).filter(SharedLink.owner_id == owner_id)

    active = base.filter(SharedLink.status == LinkStatus.ACTIVE).count()

    totals = db.query(
        func.coalesce(func.sum(SharedLink.views), 0), func.coalesce(func.sum(SharedLink.downloads), 0)
    ).filter(SharedLink.owner_id == owner_id).first()
    total_views, total_downloads = totals if totals else (0, 0)

    soon_cutoff = datetime.utcnow() + timedelta(days=7)
    expiring_soon = base.filter(
        SharedLink.status == LinkStatus.ACTIVE,
        SharedLink.expires_at.isnot(None),
        SharedLink.expires_at <= soon_cutoff,
        SharedLink.expires_at >= datetime.utcnow(),
    ).count()

    return StatsSummary(
        active_links=active, total_views=int(total_views), total_downloads=int(total_downloads),
        expiring_soon=expiring_soon,
    )


def get_monthly_activity(db: Session, owner_id: uuid.UUID, months: int = 5) -> list[MonthlyActivityPoint]:
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


def get_top_files(db: Session, owner_id: uuid.UUID, *, by: str, limit: int = 5) -> list[TopFileEntry]:
    metric_col = SharedLink.views if by == "views" else SharedLink.downloads
    rows = (
        db.query(File.id, File.original_filename, func.sum(metric_col).label("total"))
        .join(SharedLink, SharedLink.file_id == File.id)
        .filter(SharedLink.owner_id == owner_id)
        .group_by(File.id, File.original_filename)
        .order_by(func.sum(metric_col).desc())
        .limit(limit)
        .all()
    )
    return [TopFileEntry(file_id=r[0], file_name=r[1], value=int(r[2] or 0)) for r in rows]


def get_recent_activity(db: Session, owner_id: uuid.UUID, limit: int = 10) -> list[RecentActivityEntry]:
    rows = (
        db.query(AccessLog, File.original_filename)
        .join(SharedLink, AccessLog.shared_link_id == SharedLink.id)
        .join(File, SharedLink.file_id == File.id)
        .filter(SharedLink.owner_id == owner_id)
        .order_by(AccessLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        RecentActivityEntry(
            shared_link_id=log.shared_link_id, file_name=file_name, action=log.action,
            success=log.success, created_at=log.created_at,
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


# ---------------------------------------------------------------------------
# Background-job support (used by src/shared_links/scheduler.py)
# ---------------------------------------------------------------------------


def get_links_expiring_soon_unwarned(db: Session, within_hours: int) -> Sequence[SharedLink]:
    cutoff = datetime.utcnow() + timedelta(hours=within_hours)
    return (
        db.query(SharedLink)
        .options(selectinload(SharedLink.file))
        .filter(
            SharedLink.status == LinkStatus.ACTIVE,
            SharedLink.expires_at.isnot(None),
            SharedLink.expires_at <= cutoff,
            SharedLink.expires_at >= datetime.utcnow(),
            SharedLink.expiry_warning_sent.is_(False),
        )
        .all()
    )


def get_newly_expired_links(db: Session) -> Sequence[SharedLink]:
    return (
        db.query(SharedLink)
        .options(selectinload(SharedLink.file))
        .filter(
            SharedLink.status == LinkStatus.ACTIVE,
            SharedLink.expires_at.isnot(None),
            SharedLink.expires_at <= datetime.utcnow(),
        )
        .all()
    )
