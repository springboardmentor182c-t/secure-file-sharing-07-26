from datetime import datetime, timezone

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from ..entities.user import User
from ..entities.file import File
from ..entities.share_link import ShareLink
from ..entities.system_service import SystemService
from . import models

STORAGE_LIMIT_GB = 1000


def get_dashboard_stats(db: Session) -> models.DashboardStats:
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "Active").count()

    total_storage = db.query(
        func.coalesce(func.sum(User.storage_used_gb), 0)
    ).scalar()

    now = datetime.now(timezone.utc)
    files_this_month = db.query(File).filter(
        extract("month", File.uploaded_at) == now.month,
        extract("year", File.uploaded_at) == now.year,
    ).count()

    active_share_links = db.query(ShareLink).filter(
        ShareLink.is_active == True  # noqa: E712
    ).count()

    return models.DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_storage_gb=float(total_storage),
        total_storage_limit_gb=STORAGE_LIMIT_GB,
        files_this_month=files_this_month,
        active_share_links=active_share_links,
    )


def get_storage_by_user(db: Session) -> list[User]:
    return db.query(User).order_by(User.storage_used_gb.desc()).all()


def get_users_with_file_counts(db: Session) -> list[models.UserOut]:
    rows = (
        db.query(User, func.count(File.id).label("files_count"))
        .outerjoin(File, File.user_id == User.id)
        .group_by(User.id)
        .order_by(User.id)
        .all()
    )

    return [
        models.UserOut(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            mfa_enabled=user.mfa_enabled,
            status=user.status,
            storage_used_gb=float(user.storage_used_gb),
            files_count=files_count,
        )
        for user, files_count in rows
    ]


def get_monitoring(db: Session) -> list[SystemService]:
    return db.query(SystemService).all()
def invite_user(db: Session, payload: models.InviteUserRequest) -> models.UserOut:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise ValueError("A user with this email already exists")

    new_user = User(
        name=payload.name,
        email=payload.email,
        role=payload.role,
        mfa_enabled=False,
        status="Active",
        storage_used_gb=0,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return models.UserOut(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        mfa_enabled=new_user.mfa_enabled,
        status=new_user.status,
        storage_used_gb=float(new_user.storage_used_gb),
        files_count=0,
    )