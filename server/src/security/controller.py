from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core import get_db
from src.security.models import SecurityDashboardDataSchema
from src.security.service import get_security_events, get_encryption_keys, rotate_all_keys

router = APIRouter(prefix="/api/security", tags=["security"])

@router.get("/dashboard", response_model=SecurityDashboardDataSchema)
def get_dashboard_data(db: Session = Depends(get_db)):
    events = get_security_events(db)
    keys = get_encryption_keys(db)
    
    # Calculate stats based on DB
    blocked_count = sum(1 for e in events if e.blocked)
    failed_logins = 23
    mfa_coverage = "60%"
    key_rotations = len(keys)
    
    stats = [
        {"label": "Blocked attacks", "value": str(blocked_count), "sub": "last 30 days", "color": "#EF4444"},
        {"label": "Failed logins", "value": str(failed_logins), "sub": "+5 today", "color": "#F59E0B"},
        {"label": "MFA coverage", "value": mfa_coverage, "sub": "3 of 5 users", "color": "#22C55E"},
        {"label": "Key rotations", "value": str(key_rotations), "sub": "this month", "color": "#B7A2C9"},
    ]
    
    # Login attempts mock chart data
    login_attempts = [
        {"hour": "00:00", "success": 2, "failed": 1},
        {"hour": "04:00", "success": 0, "failed": 4},
        {"hour": "08:00", "success": 15, "failed": 2},
        {"hour": "12:00", "success": 28, "failed": 1},
        {"hour": "16:00", "success": 22, "failed": 5},
        {"hour": "20:00", "success": 8, "failed": 2},
    ]
    
    return {
        "stats": stats,
        "login_attempts": login_attempts,
        "events": events,
        "keys": keys
    }

@router.post("/rotate-keys")
def rotate_keys(db: Session = Depends(get_db)):
    return rotate_all_keys(db)
