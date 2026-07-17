from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.entities.file import File
from src.entities.share_link import ShareLink
from src.entities.audit_log import AuditLog
from src.security.constants import AES_KEY_SIZE
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

router = APIRouter()


class StorageStats(BaseModel):
    used_bytes: int
    quota_bytes: int
    used_gb: float
    quota_gb: float
    percent: float


class UploadTrend(BaseModel):
    date: str
    count: int


class AnalyticsSummary(BaseModel):
    total_files: int
    total_folders_shared: int
    active_share_links: int
    total_share_views: int
    storage: StorageStats
    upload_trend: list[UploadTrend]
    top_file_types: dict
    encryption_standard: str


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # File count
    total_files = db.query(File).filter(File.owner_id == current_user.id, File.is_deleted == False).count()

    # Share stats
    shares = db.query(ShareLink).filter(ShareLink.created_by == current_user.id).all()
    active_shares = sum(1 for s in shares if s.is_active)
    total_views = sum(s.access_count for s in shares)

    # Storage
    used = current_user.storage_used or 0
    quota = current_user.storage_quota or 5368709120
    storage = StorageStats(
        used_bytes=used,
        quota_bytes=quota,
        used_gb=round(used / 1e9, 2),
        quota_gb=round(quota / 1e9, 2),
        percent=round(used / quota * 100, 1) if quota else 0,
    )

    # Upload trend — last 7 days
    trend = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        count = (
            db.query(File)
            .filter(
                File.owner_id == current_user.id,
                File.is_deleted == False,
                func.date(File.created_at) == day.date(),
            )
            .count()
        )
        trend.append(UploadTrend(date=day.strftime("%a"), count=count))

    # File type breakdown
    files = db.query(File).filter(File.owner_id == current_user.id, File.is_deleted == False).all()
    type_counts: dict[str, int] = {}
    for f in files:
        ext = f.original_name.rsplit(".", 1)[-1].lower() if "." in f.original_name else "other"
        type_counts[ext] = type_counts.get(ext, 0) + 1

    return AnalyticsSummary(
        total_files=total_files,
        total_folders_shared=active_shares,
        active_share_links=active_shares,
        total_share_views=total_views,
        storage=storage,
        upload_trend=trend,
        top_file_types=type_counts,
        encryption_standard=f"AES-{AES_KEY_SIZE * 8}-GCM",
    )
