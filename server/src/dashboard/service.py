from datetime import datetime, timezone

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from ..entities.user import User
from ..entities.file import File
from ..entities.shared_link import SharedLink
from ..entities.system_service import SystemService
from ..shared_links.constants import LinkStatus   # <-- needed (see Fix 2)
from . import models

STORAGE_LIMIT_GB = 1000


def get_dashboard_stats(db: Session) -> models.DashboardStats:
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.account_status == "ACTIVE").count()

    total_storage_bytes = db.query(
        func.coalesce(func.sum(File.file_size), 0)
    ).scalar()
    total_storage_gb = float(total_storage_bytes) / 1e9

    now = datetime.now(timezone.utc)
    files_this_month = db.query(File).filter(
        extract("month", File.uploaded_at) == now.month,
        extract("year", File.uploaded_at) == now.year,
    ).count()

    active_share_links = db.query(SharedLink).filter(
        SharedLink.status == LinkStatus.ACTIVE
    ).count()

    return models.DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_storage_gb=total_storage_gb,
        total_storage_limit_gb=STORAGE_LIMIT_GB,
        files_this_month=files_this_month,
        active_share_links=active_share_links,
    )


def get_storage_by_user(db: Session) -> list[models.StorageByUser]:
    rows = (
        db.query(
            User,
            func.coalesce(func.sum(File.file_size), 0).label("total_bytes"),
        )
        .outerjoin(File, File.owner_id == User.id)
        .group_by(User.id)
        .all()
    )
    return [
        models.StorageByUser(
            name=user.full_name or user.username,
            storage_used_gb=float(total_bytes) / 1e9,
        )
        for user, total_bytes in rows
    ]


def get_users_with_file_counts(db: Session) -> list[models.UserOut]:
    rows = (
        db.query(
            User,
            func.count(File.id).label("files_count"),
            func.coalesce(func.sum(File.file_size), 0).label("total_bytes"),
        )
        .outerjoin(File, File.owner_id == User.id)
        .group_by(User.id)
        .order_by(User.created_at)
        .all()
    )

    return [
        models.UserOut(
            id=user.id,
            name=user.full_name or user.username,
            email=user.email,
            role="Viewer",       # TODO: replace once Role table is wired to User
            mfa_enabled=False,   # TODO: add real column when MFA is implemented
            status=user.account_status,
            storage_used_gb=float(total_bytes) / 1e9,
            files_count=files_count,
        )
        for user, files_count, total_bytes in rows
    ]


def get_monitoring(db: Session) -> list[SystemService]:
    return db.query(SystemService).all()


def invite_user(db: Session, payload: models.InviteUserRequest) -> models.UserOut:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise ValueError("A user with this email already exists")

    new_user = User(
        username=payload.email.split("@")[0],
        email=payload.email,
        full_name=payload.name,
        account_status="ACTIVE",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return models.UserOut(
        id=new_user.id,
        name=new_user.full_name,
        email=new_user.email,
        role=payload.role,
        mfa_enabled=False,
        status=new_user.account_status,
        storage_used_gb=0,
        files_count=0,
    )