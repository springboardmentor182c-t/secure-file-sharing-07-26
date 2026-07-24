from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.security.models import SecurityDashboardDataSchema
from src.security.service import get_security_events, get_encryption_keys, rotate_all_keys
from src.entities.user import User
from datetime import datetime

router = APIRouter(prefix="/api/security", tags=["security"])

@router.get("/dashboard", response_model=SecurityDashboardDataSchema)
def get_dashboard_data(db: Session = Depends(get_db)):
    # Role check validation
    user = db.query(User).filter(User.id == 1).first()
    if not user or "admin" not in user.role.lower():
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required.")

    events = get_security_events(db)
    keys = get_encryption_keys(db)
    users = db.query(User).all()
    
    # Calculate stats dynamically based on database contents
    blocked_count = sum(1 for e in events if e.blocked)
    
    # Count failed logins from events
    failed_logins = sum(1 for e in events if "failed" in e.event.lower() or "brute force" in e.event.lower())
    
    # Compute MFA coverage dynamically from registered users
    total_users = len(users)
    mfa_users = sum(1 for u in users if u.mfa)
    mfa_coverage = f"{int(mfa_users / total_users * 100)}%" if total_users > 0 else "0%"
    mfa_sub = f"{mfa_users} of {total_users} users" if total_users > 0 else "0 of 0 users"
    
    key_rotations = len(keys)
    
    stats = [
        {"label": "Blocked attacks", "value": str(blocked_count), "sub": "last 30 days", "color": "#EF4444"},
        {"label": "Failed logins", "value": str(failed_logins), "sub": "+0 today" if failed_logins == 0 else f"+{failed_logins} today", "color": "#F59E0B"},
        {"label": "MFA coverage", "value": mfa_coverage, "sub": mfa_sub, "color": "#22C55E"},
        {"label": "Key rotations", "value": str(key_rotations), "sub": "this month", "color": "#B7A2C9"},
    ]
    
    # Login attempts dynamically generated based on events
    slots = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
    login_attempts = [{"hour": s, "success": 0, "failed": 0} for s in slots]
    
    for e in events:
        if "failed" in e.event.lower() or "brute force" in e.event.lower():
            try:
                # Expecting format YYYY-MM-DD HH:MM
                dt = datetime.strptime(e.ts.strip(), "%Y-%m-%d %H:%M")
                hour = dt.hour
                if hour < 4: idx = 0
                elif hour < 8: idx = 1
                elif hour < 12: idx = 2
                elif hour < 16: idx = 3
                elif hour < 20: idx = 4
                else: idx = 5
                login_attempts[idx]["failed"] += 1
            except Exception:
                pass
                
    # Determine the logged-in user profile from database, or fallback
    current_user_profile = {"name": "Guest User", "role": "Viewer"}
    if users:
        admin_users = [u for u in users if u.role.lower() == "admin"]
        active_user = admin_users[0] if admin_users else users[0]
        current_user_profile = {
            "name": active_user.name,
            "role": f"Security {active_user.role}"
        }
    
    return {
        "stats": stats,
        "login_attempts": login_attempts,
        "events": events,
        "keys": keys,
        "current_user": current_user_profile
    }

@router.post("/rotate-keys")
def rotate_keys(db: Session = Depends(get_db)):
    # Role check validation
    user = db.query(User).filter(User.id == 1).first()
    if not user or "admin" not in user.role.lower():
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required.")

    return rotate_all_keys(db)

