from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.entities.audit_log import AuditLog

router = APIRouter()


@router.get(
    "/",
    summary="List audit logs",
    description="Retrieve recent audit logs with optional search query filter.",
)
def list_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    q: str = Query(None, description="Search term filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(AuditLog)
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            AuditLog.action.ilike(pattern)
            | AuditLog.resource_name.ilike(pattern)
            | AuditLog.resource_type.ilike(pattern)
            | AuditLog.ip_address.ilike(pattern)
        )
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else None,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_name": log.resource_name,
            "ip_address": log.ip_address,
            "level": log.level,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]
