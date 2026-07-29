from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.entities.security_event import SecurityEvent
from src.entities.access_log import AccessLog
from datetime import datetime

router = APIRouter(prefix="/api/audit", tags=["Audit Logs"])

@router.get("/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    try:
        security_events = db.query(SecurityEvent).all()
    except Exception:
        security_events = []

    try:
        access_logs = db.query(AccessLog).all()
    except Exception:
        access_logs = []

    audit_records = []

    # Map security events
    for se in security_events:
        audit_records.append({
            "id": f"SEC-{se.id}",
            "timestamp": getattr(se, 'ts', None) or datetime.now().strftime("%Y-%m-%d %H:%M"),
            "user": getattr(se, 'source', None) or "System",
            "action": getattr(se, 'event', None) or "SECURITY_EVENT",
            "category": "Security Threat" if getattr(se, 'blocked', False) or (getattr(se, 'severity', '') and getattr(se, 'severity', '').lower() in ["high", "critical"]) else "Authentication",
            "severity": (getattr(se, 'severity', 'info') or "info").lower(),
            "status": "Blocked" if getattr(se, 'blocked', False) else "Success",
            "ipAddress": getattr(se, 'source', None) or "127.0.0.1",
            "country": getattr(se, 'country', None) or "US",
            "details": f"Security action: {getattr(se, 'event', 'Event')}. Origin IP: {getattr(se, 'source', 'Local')}. Status: {'BLOCKED' if getattr(se, 'blocked', False) else 'SUCCESS'}."
        })

    # Map file & link access logs
    for al in access_logs:
        created_dt = getattr(al, 'created_at', None) or getattr(al, 'accessed_at', None)
        ts_str = created_dt.strftime("%Y-%m-%d %H:%M") if hasattr(created_dt, 'strftime') else datetime.now().strftime("%Y-%m-%d %H:%M")
        action_str = getattr(al, 'action', 'access') or 'access'
        success_val = getattr(al, 'success', True)
        reason_val = getattr(al, 'reason', '')
        audit_records.append({
            "id": f"ACC-{str(getattr(al, 'id', '0'))[:8]}",
            "timestamp": ts_str,
            "user": getattr(al, 'ip_address', '127.0.0.1') or "127.0.0.1",
            "action": f"FILE_{action_str.upper()}_REQUEST",
            "category": "File Access",
            "severity": "info" if success_val else "medium",
            "status": "Success" if success_val else "Denied",
            "ipAddress": getattr(al, 'ip_address', '127.0.0.1') or "127.0.0.1",
            "country": "US",
            "details": f"Shared link operation {action_str.upper()}. Result: {'SUCCESS' if success_val else reason_val or 'DENIED'}."
        })

    # Sort newest first
    audit_records.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "status": "success",
        "total": len(audit_records),
        "logs": audit_records
    }
