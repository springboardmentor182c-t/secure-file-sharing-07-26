from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

def get_user_notifications(db: Session = None):
    now = datetime.now(timezone.utc)
    
    return [
        {
            "id": "1",
            "title": "Failed login attempt detected",
            "message": "A suspicious login attempt was detected on your account.",
            "description": "A suspicious login attempt was detected on your account.",
            "created_at": (now - timedelta(minutes=6)).isoformat(),
            "category": "Security",
            "type": "security",
            "read": False,
            "isNew": True
        },
        {
            "id": "2",
            "title": "File shared with you",
            "message": "A new file has been shared with you by another user.",
            "description": "A new file has been shared with you by another user.",
            "created_at": (now - timedelta(hours=1)).isoformat(),
            "category": "Shares",
            "type": "shares",
            "read": False,
            "isNew": True
        },
        {
            "id": "3",
            "title": "Upload completed",
            "message": "Your file upload has been completed successfully.",
            "description": "Your file upload has been completed successfully.",
            "created_at": (now - timedelta(hours=2)).isoformat(),
            "category": "Uploads",
            "type": "uploads",
            "read": False,
            "isNew": True
        }
    ]