import secrets
import bcrypt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.sharing.model import ShareLink, SharePermission # Aapne model.py rakha hai, toh wahi import kiya hai

def create_secure_link(db: Session, file_id: str, user_id: str, share_type: str, expiry_days: int, password: str = None, max_dl: int = 10):
    # 1. Unique short token generation (e.g., Xk9m3P)
    token = secrets.token_urlsafe(8)
    
    # 2. encryot password if present
    hashed_pwd = None
    if password:
        salt = bcrypt.gensalt()
        hashed_pwd = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
    # 3. Expiry date calculation
    expiry_date = None
    if expiry_days > 0:
        expiry_date = datetime.utcnow() + timedelta(days=expiry_days)
        
    # 4. saving new link in DB
    db_link = ShareLink(
        file_id=file_id,
        created_by=user_id,
        share_token=token,
        share_type=share_type,
        password_hash=hashed_pwd,
        expires_at=expiry_date,
        max_downloads=max_dl
    )
    
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    
    # 5. Default permissions
    db_permission = SharePermission(
        share_link_id=db_link.id,
        user_id=user_id,
        can_view=True,
        can_download=True
    )
    db.add(db_permission)
    db.commit()
    
    return db_link