from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.entities.folder import Folder
from src.entities.audit_log import AuditLog

router = APIRouter()

PAGES = [
    {"title": "Dashboard", "description": "Overview & statistics", "url": "/dashboard", "category": "Pages"},
    {"title": "Analytics", "description": "Storage & performance metrics", "url": "/analytics", "category": "Pages"},
    {"title": "Activity Logs", "description": "Security audit trail", "url": "/activity", "category": "Pages"},
    {"title": "Notifications", "description": "System alerts & feed", "url": "/notifications", "category": "Pages"},
    {"title": "Settings", "description": "Profile & MFA setup", "url": "/settings", "category": "Pages"},
    {"title": "Sharing", "description": "Shared file management", "url": "/sharing", "category": "Pages"},
    {"title": "Admin Panel", "description": "User management & quotas", "url": "/admin", "category": "Pages"},
]


@router.get(
    "/",
    summary="Global search endpoint",
    description="Search across application pages, users, folders, and activity logs.",
)
def global_search(
    q: str = Query("", description="Search query string"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query_str = q.strip().lower()
    if not query_str:
        return {"pages": [], "users": [], "folders": [], "logs": []}

    # 1. Pages search
    matched_pages = [
        p for p in PAGES
        if query_str in p["title"].lower()
        or query_str in p["description"].lower()
        or query_str in p["url"].lower()
    ]

    # 2. Users search
    pattern = f"%{query_str}%"
    users_db = (
        db.query(User)
        .filter(
            User.name.ilike(pattern)
            | User.email.ilike(pattern)
            | User.role.ilike(pattern)
        )
        .limit(5)
        .all()
    )
    users_res = [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "url": "/admin" if current_user.role == "admin" else "/dashboard",
        }
        for u in users_db
    ]

    # 3. Folders search
    folders_db = (
        db.query(Folder)
        .filter(
            Folder.owner_id == current_user.id,
            Folder.name.ilike(pattern)
        )
        .limit(5)
        .all()
    )
    folders_res = [
        {
            "id": str(f.id),
            "name": f.name,
            "url": f"/dashboard?folder={f.id}",
        }
        for f in folders_db
    ]

    # 4. Audit logs search
    logs_db = (
        db.query(AuditLog)
        .filter(
            AuditLog.action.ilike(pattern)
            | AuditLog.resource_name.ilike(pattern)
            | AuditLog.resource_type.ilike(pattern)
            | AuditLog.ip_address.ilike(pattern)
        )
        .order_by(AuditLog.created_at.desc())
        .limit(5)
        .all()
    )
    logs_res = [
        {
            "id": str(l.id),
            "action": l.action,
            "resource_name": l.resource_name or l.resource_type or "",
            "level": l.level,
            "url": "/activity",
        }
        for l in logs_db
    ]

    return {
        "query": q,
        "pages": matched_pages,
        "users": users_res,
        "folders": folders_res,
        "logs": logs_res,
    }
