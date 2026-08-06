from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.entities.security_event import SecurityEvent
from src.entities.access_log import AccessLog
from datetime import datetime

router = APIRouter(prefix="/api/audit", tags=["Audit Logs"])

@router.get("/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    audit_records = []

    try:
        security_events = db.query(SecurityEvent).all()
        for se in security_events:
            sev_val = (getattr(se, 'severity', 'info') or "info").lower()
            if sev_val == "low":
                sev_val = "info"
            audit_records.append({
                "id": f"SEC-{se.id}",
                "timestamp": getattr(se, 'ts', None) or datetime.now().strftime("%Y-%m-%d %H:%M"),
                "user": getattr(se, 'source', None) or "System",
                "action": getattr(se, 'event', None) or "SECURITY_EVENT",
                "category": "Security Threat" if getattr(se, 'blocked', False) or sev_val in ["high", "critical"] else "Authentication",
                "severity": sev_val,
                "status": "Blocked" if getattr(se, 'blocked', False) else "Success",
                "ipAddress": getattr(se, 'source', None) or "127.0.0.1",
                "country": getattr(se, 'country', None) or "Local",
                "details": f"Security action: {getattr(se, 'event', 'Event')}. Origin IP: {getattr(se, 'source', 'Local')}. Status: {'BLOCKED' if getattr(se, 'blocked', False) else 'SUCCESS'}."
            })
    except Exception:
        db.rollback()

    try:
        access_logs = db.query(AccessLog).all()
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
                "country": "Local",
                "details": f"Shared link operation {action_str.upper()}. Result: {'SUCCESS' if success_val else reason_val or 'DENIED'}."
            })
    except Exception:
        db.rollback()

    # Map PostgreSQL shared_links
    try:
        rows = db.execute(text("SELECT id, file_id, recipient_email, permission, status, views, downloads, created_at FROM shared_links ORDER BY id DESC")).fetchall()
        for r in rows:
            ts = r[7].strftime("%Y-%m-%d %H:%M") if hasattr(r[7], 'strftime') else str(r[7] or datetime.now().strftime("%Y-%m-%d %H:%M"))
            recip = str(r[2]) if r[2] else "Unassigned"
            f_name = str(r[1]) if r[1] else f"file_{r[0]}"
            perm = str(r[3]) if r[3] else "download"
            v_cnt = r[5] if r[5] is not None else 0
            d_cnt = r[6] if r[6] is not None else 0
            audit_records.append({
                "id": f"LINK-{r[0]}",
                "timestamp": ts,
                "user": recip,
                "action": "SHARED_LINK_CREATED",
                "category": "File Access",
                "severity": "info",
                "status": "Success",
                "ipAddress": "127.0.0.1",
                "country": "Local",
                "details": f"Encrypted share link created for {f_name}. Recipient: {recip}. Permission: {perm}. Views: {v_cnt}, Downloads: {d_cnt}."
            })
    except Exception as e:
        db.rollback()
        print("[AUDIT ERROR]:", e)

    audit_records.sort(key=lambda x: str(x["timestamp"]), reverse=True)

    return {
        "status": "success",
        "total": len(audit_records),
        "logs": audit_records
    }
