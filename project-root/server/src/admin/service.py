"""Admin panel business logic — stats, user management, roles, storage, audit."""

import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from src.auth.dependencies import hash_password
from src.entities.audit_log import AuditLog
from src.entities.file import File
from src.entities.user import User

DEFAULT_QUOTA = 5368709120  # 5 GB — mirrors User.storage_quota default

# The `role` column is a free-form string; this catalog is the set the panel
# offers, with the display names used in the UI.
ROLE_CATALOG = [
    {
        "key": "admin",
        "label": "Admin",
        "permissions": ["Full access", "All settings", "User management"],
    },
    {
        "key": "manager",
        "label": "Manager",
        "permissions": ["Share", "Upload", "View logs", "Manage team"],
    },
    {
        "key": "member",
        "label": "Editor",
        "permissions": ["Upload", "Share", "Download", "View own files"],
    },
    {
        "key": "guest",
        "label": "Viewer",
        "permissions": ["View files", "Download shared", "Read-only"],
    },
]

VALID_ROLES = {r["key"] for r in ROLE_CATALOG}

# Mimetype prefix/keyword → storage bucket shown on the Storage tab.
STORAGE_BUCKETS = [
    ("Documents", ("application/pdf", "application/msword", "application/vnd", "text/")),
    ("Media", ("image/", "video/", "audio/")),
    ("Archives", ("application/zip", "application/x-tar", "application/gzip",
                  "application/x-7z", "application/vnd.rar", "application/x-rar")),
]

# Audit levels that count as a policy violation on the stats row.
VIOLATION_LEVELS = ("error", "critical", "warn")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _bucket_for(mimetype: Optional[str]) -> str:
    mt = (mimetype or "").lower()
    for name, prefixes in STORAGE_BUCKETS:
        if mt.startswith(prefixes):
            return name
    return "Other"


def record_admin_action(
    db: Session,
    admin_id: int,
    action: str,
    target: Optional[str] = None,
    target_id: Optional[int] = None,
    level: str = "info",
) -> None:
    """Write an admin action to the audit trail. Caller owns the commit."""
    db.add(
        AuditLog(
            user_id=admin_id,
            action=action,
            resource_type="user",
            resource_id=target_id,
            resource_name=target,
            level=level,
        )
    )


# ── Stats ────────────────────────────────────────────────────────────────────

def get_stats(db: Session) -> dict:
    cutoff = _now() - timedelta(days=30)

    total_users = db.query(func.count(User.id)).scalar() or 0
    new_users_30d = (
        db.query(func.count(User.id)).filter(User.created_at >= cutoff).scalar() or 0
    )
    mfa_enabled = (
        db.query(func.count(User.id)).filter(User.mfa_enabled.is_(True)).scalar() or 0
    )

    storage_total = db.query(func.coalesce(func.sum(User.storage_quota), 0)).scalar() or 0
    if storage_total == 0:
        storage_total = max(total_users, 1) * DEFAULT_QUOTA

    storage_used = (
        db.query(func.coalesce(func.sum(File.size), 0))
        .filter(File.is_deleted.is_(False))
        .scalar()
        or 0
    )

    violations = (
        db.query(func.count(AuditLog.id))
        .filter(AuditLog.level.in_(VIOLATION_LEVELS))
        .filter(AuditLog.created_at >= cutoff)
        .scalar()
        or 0
    )

    return {
        "total_users": total_users,
        "new_users_30d": new_users_30d,
        "active_users": db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0,
        "storage_total_bytes": int(storage_total),
        "storage_used_bytes": int(storage_used),
        "storage_used_pct": round(storage_used / storage_total * 100, 1) if storage_total else 0.0,
        "mfa_enabled_count": mfa_enabled,
        "mfa_enabled_pct": round(mfa_enabled / total_users * 100) if total_users else 0,
        "policy_violations": violations,
    }


# ── Users ────────────────────────────────────────────────────────────────────

def list_users(
    db: Session,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
) -> list[User]:
    q = db.query(User)

    if search:
        term = f"%{search.strip().lower()}%"
        q = q.filter(or_(func.lower(User.name).like(term), func.lower(User.email).like(term)))
    if role:
        q = q.filter(User.role == role)
    if status == "active":
        q = q.filter(User.is_active.is_(True))
    elif status == "suspended":
        q = q.filter(User.is_active.is_(False))

    return q.order_by(User.created_at.desc()).all()


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_user(db: Session, admin: User, user_id: int, data) -> User:
    if user_id == admin.id:
        raise HTTPException(
            status_code=400, detail="Cannot modify your own account via the admin panel"
        )

    user = get_user_or_404(db, user_id)
    changes = []

    if data.role is not None:
        if data.role not in VALID_ROLES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}",
            )
        if data.role != user.role:
            changes.append(f"role {user.role} → {data.role}")
            user.role = data.role

    if data.plan is not None and data.plan != user.plan:
        changes.append(f"plan {user.plan} → {data.plan}")
        user.plan = data.plan

    if data.storage_quota is not None:
        if data.storage_quota <= 0:
            raise HTTPException(status_code=400, detail="Storage quota must be positive")
        changes.append("storage quota updated")
        user.storage_quota = data.storage_quota

    toggled_active = None
    if data.is_active is not None and data.is_active != user.is_active:
        toggled_active = data.is_active
        changes.append("enabled account" if data.is_active else "disabled account")
        user.is_active = data.is_active

    if changes:
        if toggled_active is False:
            action, level = "Disabled user account", "warn"
        elif toggled_active is True:
            action, level = "Enabled user account", "success"
        else:
            action, level = "Updated role permissions", "success"
        record_admin_action(db, admin.id, action, target=user.email, target_id=user.id, level=level)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, admin: User, user_id: int) -> None:
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = get_user_or_404(db, user_id)

    if user.role == "admin":
        remaining_admins = (
            db.query(func.count(User.id))
            .filter(User.role == "admin", User.id != user_id)
            .scalar()
            or 0
        )
        if remaining_admins == 0:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin account")

    email = user.email
    db.delete(user)
    record_admin_action(db, admin.id, "Deleted user account", target=email, level="warn")
    db.commit()


def invite_user(db: Session, admin: User, data) -> tuple[User, str]:
    email = data.email.strip().lower()

    if db.query(User).filter(func.lower(User.email) == email).first():
        raise HTTPException(status_code=409, detail="A user with that email already exists")
    if data.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(sorted(VALID_ROLES))}",
        )

    alphabet = string.ascii_letters + string.digits
    temp_password = "".join(secrets.choice(alphabet) for _ in range(14))

    user = User(
        name=data.name.strip(),
        email=email,
        hashed_password=hash_password(temp_password),
        role=data.role,
        plan=data.plan or "free",
        storage_quota=data.storage_quota or DEFAULT_QUOTA,
        is_active=True,
    )
    db.add(user)
    db.flush()  # populate user.id before the audit row references it

    record_admin_action(
        db, admin.id, "Invited user", target=email, target_id=user.id, level="success"
    )
    db.commit()
    db.refresh(user)
    return user, temp_password


# ── Roles ────────────────────────────────────────────────────────────────────

def list_roles(db: Session) -> list[dict]:
    counts = dict(db.query(User.role, func.count(User.id)).group_by(User.role).all())
    return [
        {
            "key": r["key"],
            "label": r["label"],
            "permissions": r["permissions"],
            "user_count": counts.get(r["key"], 0),
        }
        for r in ROLE_CATALOG
    ]


# ── Storage ──────────────────────────────────────────────────────────────────

def get_storage(db: Session) -> dict:
    stats = get_stats(db)

    rows = (
        db.query(File.mimetype, func.coalesce(func.sum(File.size), 0), func.count(File.id))
        .filter(File.is_deleted.is_(False))
        .group_by(File.mimetype)
        .all()
    )

    buckets = {name: {"bytes": 0, "files": 0} for name, _ in STORAGE_BUCKETS}
    buckets["Other"] = {"bytes": 0, "files": 0}
    for mimetype, size, count in rows:
        b = buckets[_bucket_for(mimetype)]
        b["bytes"] += int(size or 0)
        b["files"] += int(count or 0)

    top_users = (
        db.query(User.id, User.name, User.email, User.storage_used, User.storage_quota)
        .order_by(User.storage_used.desc())
        .limit(5)
        .all()
    )

    return {
        "total_bytes": stats["storage_total_bytes"],
        "used_bytes": stats["storage_used_bytes"],
        "used_pct": stats["storage_used_pct"],
        "breakdown": [
            {"label": name, "bytes": v["bytes"], "files": v["files"]}
            for name, v in buckets.items()
        ],
        "top_users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "used_bytes": int(u.storage_used or 0),
                "quota_bytes": int(u.storage_quota or DEFAULT_QUOTA),
            }
            for u in top_users
        ],
    }


# ── Audit ────────────────────────────────────────────────────────────────────

def list_audit_logs(db: Session, limit: int = 50, skip: int = 0) -> list[dict]:
    rows = (
        db.query(AuditLog, User.name, User.email)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": log.id,
            "created_at": log.created_at,
            "admin_name": name or "System",
            "admin_email": email,
            "action": log.action,
            "target": log.resource_name or (log.resource_type or "—"),
            "level": log.level or "info",
            "result": "Failed" if (log.level or "").lower() in ("error", "critical") else "Success",
            "ip_address": log.ip_address,
        }
        for log, name, email in rows
    ]
