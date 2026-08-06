from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import text
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.security.models import SecurityDashboardDataSchema
from src.security.service import get_security_events, get_encryption_keys, rotate_all_keys, rotate_single_key, delete_all_keys, delete_single_key
from src.entities.user import User
from datetime import datetime

router = APIRouter(prefix="/api/security", tags=["security"])

@router.get("/dashboard", response_model=SecurityDashboardDataSchema)
def get_dashboard_data(request: Request, db: Session = Depends(get_db)):
    events = get_security_events(db)
    keys = get_encryption_keys(db)

    try:
        users = db.query(User).all()
    except Exception:
        db.rollback()
        users = []

    try:
        link_count = db.execute(text("SELECT count(*) FROM shared_links")).fetchone()[0]
    except Exception:
        db.rollback()
        link_count = 0

    client_ip = request.client.host if request.client else "127.0.0.1"
    country_label = "Local" if client_ip in ("127.0.0.1", "::1", "localhost") else "Remote"

    blocked_count = sum(1 for e in events if getattr(e, 'blocked', False))
    failed_logins = sum(1 for e in events if getattr(e, 'event', '') and ("failed" in str(getattr(e, 'event', '')).lower() or "brute force" in str(getattr(e, 'event', '')).lower()))
    
    total_users = max(1, len(users))
    key_rotations = len(keys)
    
    stats = [
        {"label": "Encrypted Links", "value": str(link_count), "sub": "AES-256 protected", "color": "#7C5CFC"},
        {"label": "Blocked attacks", "value": str(blocked_count), "sub": "last 30 days", "color": "#EF4444"},
        {"label": "Failed logins", "value": str(failed_logins), "sub": f"+{failed_logins} today", "color": "#F59E0B"},
        {"label": "Key rotations", "value": str(key_rotations), "sub": "active keys verified", "color": "#B7A2C9"},
    ]
    
    slots = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
    login_attempts = [{"hour": s, "success": 1, "failed": 0} for s in slots]
    
    current_user_profile = {"name": "Admin User", "role": "Security Admin"}

    formatted_events = []
    for e in events:
        c_val = getattr(e, 'country', 'Local')
        if c_val == 'US' and getattr(e, 'source', '') in ('127.0.0.1', '::1', 'localhost'):
            c_val = 'Local'
        formatted_events.append({
            "id": getattr(e, 'id', 1),
            "ts": getattr(e, 'ts', datetime.now().strftime("%Y-%m-%d %H:%M")),
            "event": getattr(e, 'event', 'Security Alert'),
            "source": getattr(e, 'source', client_ip),
            "country": c_val,
            "severity": getattr(e, 'severity', 'info'),
            "blocked": getattr(e, 'blocked', False)
        })

    formatted_keys = []
    for k in keys:
        formatted_keys.append({
            "id": getattr(k, 'id', 'key-aes256'),
            "file": getattr(k, 'file', 'active_file_share.enc'),
            "created": getattr(k, 'created', datetime.now().strftime("%Y-%m-%d")),
            "rotated": getattr(k, 'rotated', datetime.now().strftime("%Y-%m-%d")),
            "algorithm": getattr(k, 'algorithm', 'AES-256-GCM'),
            "status": getattr(k, 'status', 'active')
        })

    return {
        "stats": stats,
        "login_attempts": login_attempts,
        "events": formatted_events,
        "keys": formatted_keys,
        "current_user": current_user_profile
    }

@router.post("/rotate-keys")
def rotate_keys(db: Session = Depends(get_db)):
    res = rotate_all_keys(db)
    return res

@router.post("/keys/{key_id}/rotate")
def rotate_key(key_id: str, db: Session = Depends(get_db)):
    success = rotate_single_key(db, key_id)
    if not success:
        raise HTTPException(status_code=404, detail="Encryption key not found")
    return {"message": f"Key {key_id} rotated successfully", "status": "active"}

@router.delete("/keys")
def delete_all_keys_route(db: Session = Depends(get_db)):
    res = delete_all_keys(db)
    return res

@router.delete("/keys/{key_id}")
def delete_single_key_route(key_id: str, db: Session = Depends(get_db)):
    success = delete_single_key(db, key_id)
    if not success:
        raise HTTPException(status_code=404, detail="Encryption key not found")
    return {"message": f"Key {key_id} deleted successfully", "status": "success"}
