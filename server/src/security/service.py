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