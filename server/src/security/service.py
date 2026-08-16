from sqlalchemy.orm import Session
from datetime import datetime
from src.entities.security_event import SecurityEvent
from src.entities.encryption_key import EncryptionKey
from src.entities.user import User

def get_security_events(db: Session):
    return db.query(SecurityEvent).all()

def get_encryption_keys(db: Session):
    return db.query(EncryptionKey).all()

def rotate_all_keys(db: Session):
    today_str = datetime.now().strftime("%b %d, %Y")
    keys = db.query(EncryptionKey).all()
    for key in keys:
        key.rotated = today_str
        key.status = "active"
    db.commit()
    return {"message": f"Successfully rotated all keys on {today_str}", "status": "success"}

def seed_db(db: Session):
    # Seed users
    if db.query(User).count() == 0:
        users = [
            User(id=1, name="Alex Chen", email="alex@acme.com", role="Admin", storage="412 GB", files=47, last_login="Active now", status="active", mfa=True),
            User(id=2, name="Sarah Kim", email="sarah@acme.com", role="Editor", storage="89 GB", files=23, last_login="2 hours ago", status="active", mfa=True),
            User(id=3, name="Mike Torres", email="mike@acme.com", role="Viewer", storage="234 GB", files=156, last_login="1 day ago", status="active", mfa=False),
            User(id=4, name="Emily Walsh", email="emily@acme.com", role="Editor", storage="45 GB", files=34, last_login="3 days ago", status="active", mfa=True),
            User(id=5, name="Jordan Lee", email="jordan@acme.com", role="Viewer", storage="12 GB", files=8, last_login="1 week ago", status="inactive", mfa=False)
        ]
        db.add_all(users)
    
    # Seed security events
    if db.query(SecurityEvent).count() == 0:
        events = [
            SecurityEvent(id=1, ts="2024-01-15 14:28", event="Brute Force Attack", source="185.220.101.34", country="RU", severity="critical", blocked=True),
            SecurityEvent(id=2, ts="2024-01-15 14:10", event="Multiple Failed Logins", source="10.0.2.88", country="US", severity="high", blocked=True),
            SecurityEvent(id=3, ts="2024-01-15 13:41", event="API Abuse Attempt", source="45.33.32.156", country="NL", severity="high", blocked=True),
            SecurityEvent(id=4, ts="2024-01-15 11:55", event="Unusual Permission Change", source="172.16.0.5", country="US", severity="medium", blocked=False),
            SecurityEvent(id=5, ts="2024-01-14 09:22", event="Suspicious Download Pattern", source="192.168.1.99", country="US", severity="medium", blocked=False),
            SecurityEvent(id=6, ts="2024-01-13 16:45", event="Geo-Anomaly Login", source="91.108.4.0", country="CN", severity="low", blocked=False),
        ]
        db.add_all(events)
    
    # Seed encryption keys
    if db.query(EncryptionKey).count() == 0:
        keys = [
            EncryptionKey(id="key-001", file="Q4-Financial-Report.pdf", created="Jan 15, 2024", rotated="Jan 15, 2024", algorithm="AES-256-GCM", status="active"),
            EncryptionKey(id="key-002", file="Design-Assets-2024.zip", created="Jan 14, 2024", rotated="Jan 14, 2024", algorithm="AES-256-GCM", status="active"),
            EncryptionKey(id="key-003", file="Product-Roadmap-2024.docx", created="Jan 12, 2024", rotated="Jan 12, 2024", algorithm="AES-256-GCM", status="active"),
            EncryptionKey(id="key-004", file="Old-File-2023.pdf (deleted)", created="Oct 5, 2023", rotated="Nov 1, 2023", algorithm="AES-256-CBC", status="rotated"),
        ]
        db.add_all(keys)
    
    db.commit()
