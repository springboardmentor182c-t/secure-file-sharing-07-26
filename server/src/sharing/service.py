import secrets
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.sharing.model import ShareLink, SharePermission

def generate_secure_token(length: int = 8) -> str:
    """
    Generates a cryptographically secure random alphanumeric token.
    """
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_secure_link(db: Session, request_data, file_id: str, user_id: str) -> ShareLink:
    """
    Processes the request payload, calculates constraints (expiry, permissions), 
    and persists the new sharing link and associated ACLs to the database.
    """
    # Token generation
    token = generate_secure_token()
    
    # Password handling logic (Stored as plain text temporarily for testing purposes)
    hashed_pwd = request_data.password if request_data.usePassword else None

    # Expiry date calculation based on client input
    expiry_date = None
    if request_data.expiry == '24 hours':
        expiry_date = datetime.utcnow() + timedelta(days=1)
    elif request_data.expiry == '7 days':
        expiry_date = datetime.utcnow() + timedelta(days=7)
    elif request_data.expiry == '30 days':
        expiry_date = datetime.utcnow() + timedelta(days=30)

    # Share type determination logic
    share_type = "private" if request_data.allowedEmails else "public"

    # Database model instantiation for the share link
    new_link = ShareLink(
        file_id=file_id,
        created_by=user_id,
        share_token=token,
        share_type=share_type,
        password_hash=hashed_pwd,
        expires_at=expiry_date,
        max_downloads=int(request_data.maxDownloads),
        apply_watermark=request_data.applyWatermark,
        notify_me=request_data.notifyMe,
        one_time_view=request_data.oneTimeView
    )
    
    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    # Access Control List (ACL) processing for private shares
    if request_data.allowedEmails:
        email_list = [email.strip() for email in request_data.allowedEmails.split(",")]
        for email in email_list:
            if email:
                new_permission = SharePermission(
                    share_link_id=new_link.id,
                    user_email=email,
                    access_level=request_data.accessLevel
                )
                db.add(new_permission)
        db.commit()

    return new_link