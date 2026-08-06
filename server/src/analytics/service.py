from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.entities.user import User
from src.entities.file import File
from src.entities.folder import Folder
from src.entities.audit_log import AuditLog
from src.analytics import models


def _fmt_bytes(b: int) -> str:
    if b >= 1 << 30:
        return f"{b / (1 << 30):.1f} GB"
    if b >= 1 << 20:
        return f"{b / (1 << 20):.1f} MB"
    if b >= 1 << 10:
        return f"{b / (1 << 10):.1f} KB"
    return f"{b} B"


def _time_ago(dt: datetime) -> str:
    if dt is None:
        return "–"
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    s = int(diff.total_seconds())
    if s < 60:
        return f"{s}s ago"
    if s < 3600:
        return f"{s // 60}m ago"
    if s < 86400:
        return f"{s // 3600}h ago"
    return f"{s // 86400}d ago"


def _mime_group(mime: str, filename: str = "") -> str:
    m = (mime or "").lower()
    name = (filename or "").lower()

    if "image" in m or "png" in m or "jpg" in m or "jpeg" in m or "gif" in m or "svg" in m or "image" in name or name.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg")):
        return "Images"
    if "video" in m or "mp4" in m or "mkv" in m or "video" in name or name.endswith((".mp4", ".mkv", ".avi", ".mov")):
        return "Videos"
    if "audio" in m or "mp3" in m or "audio" in name or name.endswith((".mp3", ".wav", ".flac")):
        return "Audio"
    if "spreadsheet" in m or "excel" in m or "csv" in m or "csv" in name or name.endswith((".xlsx", ".csv")):
        return "Spreadsheets"
    if "zip" in m or "tar" in m or "gz" in m or "7z" in m or "rar" in m or name.endswith((".zip", ".tar.gz", ".7z")):
        return "Archives"
    if "pdf" in m or "document" in m or "word" in m or "text" in m or "pdf" in name or name.endswith((".pdf", ".docx", ".doc", ".txt")):
        return "Documents"
    # Default all user files and E2EE encrypted files to Documents
    return "Documents"
def build_summary(db: Session, user: User) -> models.AnalyticsSummary:
    now = datetime.now(timezone.utc)
    day_ago   = now - timedelta(days=1)
    week_ago  = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Strictly filter by current logged-in user's data
    base = db.query(File).filter(File.owner_id == user.id, File.is_deleted.is_(False))
    recent_logs_query = db.query(AuditLog).filter(AuditLog.user_id == user.id)

    # ── Core counts ──────────────────────────────────────────────────────────
    total_files = base.count()
    enc_files   = base.filter(File.encrypted.is_(True)).count()
    total_size  = db.query(func.coalesce(func.sum(File.size), 0)).filter(
        File.owner_id == user.id, File.is_deleted.is_(False)
    ).scalar() or 0
    folders     = db.query(Folder).filter(Folder.owner_id == user.id).count()

    # Uploads this week vs last week for this user
    uploads_this_week = db.query(AuditLog).filter(
        AuditLog.user_id == user.id,
        AuditLog.action.ilike("%upload%"),
        AuditLog.created_at >= week_ago,
    ).count()
    uploads_last_week = db.query(AuditLog).filter(
        AuditLog.user_id == user.id,
        AuditLog.action.ilike("%upload%"),
        AuditLog.created_at >= (now - timedelta(days=14)),
        AuditLog.created_at < week_ago,
    ).count()

    if uploads_last_week:
        upload_trend_val = round((uploads_this_week - uploads_last_week) / uploads_last_week * 100)
    else:
        upload_trend_val = 100 if uploads_this_week else 0
    upload_trend_str = f"+{upload_trend_val}%" if upload_trend_val >= 0 else f"{upload_trend_val}%"

    enc_pct = round(enc_files / total_files * 100) if total_files else 0
    quota   = user.storage_quota or 5368709120
    used_pct_raw = total_size / quota * 100
    used_pct = round(used_pct_raw, 1)

    stats = [
        models.StatCard(
            label="Total Files",
            value=str(total_files),
            sub=f"{uploads_this_week} uploads this week",
            trend=upload_trend_str,
            trend_up=upload_trend_val >= 0,
        ),
        models.StatCard(
            label="Storage Used",
            value=_fmt_bytes(total_size),
            sub=f"{used_pct}% of {_fmt_bytes(quota)} quota",
            trend=f"{used_pct}%",
            trend_up=used_pct < 80,
        ),
        models.StatCard(
            label="Encrypted",
            value=f"{enc_pct}%",
            sub=f"{enc_files} of {total_files} files",
            trend="+100%" if enc_pct == 100 else f"{enc_pct}%",
            trend_up=enc_pct >= 80,
        ),
        models.StatCard(
            label="Folders",
            value=str(folders),
            sub="Active directories",
            trend="0%",
            trend_up=True,
        ),
    ]

    # ── 7-day activity ───────────────────────────────────────────────────────
    activity: list[models.ActivityPoint] = []
    for i in range(6, -1, -1):
        day_start = now - timedelta(days=i + 1)
        day_end   = now - timedelta(days=i)
        label = day_start.strftime("%a")

        def _cnt(action_kw: str) -> int:
            return db.query(AuditLog).filter(
                AuditLog.user_id == user.id,
                AuditLog.action.ilike(f"%{action_kw}%"),
                AuditLog.created_at >= day_start,
                AuditLog.created_at < day_end,
            ).count()

        activity.append(models.ActivityPoint(
            label=label,
            uploads=_cnt("upload"),
            downloads=_cnt("download"),
            encryptions=_cnt("encrypt"),
        ))

    # ── File type breakdown ──────────────────────────────────────────────────
    all_files = base.all()
    groups: dict[str, int] = {}
    bytes_by_group: dict[str, int] = {}
    for f in all_files:
        g = _mime_group(f.mimetype, f.original_name or f.filename or "")
        groups[g] = groups.get(g, 0) + 1
        bytes_by_group[g] = bytes_by_group.get(g, 0) + (f.size or 0)

    file_types: list[models.FileTypeStat] = []
    for g, cnt in sorted(groups.items(), key=lambda x: -x[1]):
        file_types.append(models.FileTypeStat(
            mime_group=g,
            count=cnt,
            pct=round(cnt / total_files * 100) if total_files else 0,
        ))

    # ── Recent audit actions ─────────────────────────────────────────────────
    recent_logs = (
        recent_logs_query
        .order_by(AuditLog.created_at.desc())
        .limit(8)
        .all()
    )
    def _clean_resource(name: str | None, rtype: str | None) -> str:
        if not name:
            return rtype or "–"
        if name.startswith("e2ee:"):
            return "Encrypted file"
        return name

    recent_actions = [
        models.RecentAction(
            action=log.action.replace("_", " ").title(),
            resource=_clean_resource(log.resource_name, log.resource_type),
            level=log.level or "info",
            time_ago=_time_ago(log.created_at),
        )
        for log in recent_logs
    ]

    # ── Storage breakdown ────────────────────────────────────────────────────
    storage = models.StorageBreakdown(
        label=_fmt_bytes(total_size),
        bytes_used=total_size,
        pct=max(used_pct, 0.1) if total_size > 0 else 0.0,
        color="#3b82f6",
    )

    return models.AnalyticsSummary(
        stats=stats,
        activity=activity,
        file_types=file_types,
        recent_actions=recent_actions,
        storage=storage,
        storage_quota_gb=round(quota / (1 << 30), 1),
        storage_used_gb=round(total_size / (1 << 30), 3),
    )
