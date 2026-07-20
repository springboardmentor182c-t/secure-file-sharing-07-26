from sqlalchemy.orm import Session
from src.entities.file_share import File, FileShare
from src.entities.user import User

def get_shared_files(db: Session, user_id: int = 1):
    return db.query(FileShare).filter(FileShare.shared_with_user_id == user_id).all()

def revoke_share(db: Session, share_id: int, user_id: int = 1):
    share = db.query(FileShare).filter(
        FileShare.id == share_id, 
        FileShare.shared_with_user_id == user_id
    ).first()
    if share:
        db.delete(share)
        db.commit()
        return True
    return False

def seed_shares(db: Session):
    # Purge all mock records to ensure a clean database state
    from src.entities.encryption_key import EncryptionKey
    from src.entities.security_event import SecurityEvent
    
    db.query(FileShare).delete()
    db.query(File).delete()
    db.query(EncryptionKey).delete()
    db.query(SecurityEvent).delete()
    db.query(User).filter(User.id != 1).delete()
    db.commit()

    # Ensure active current user exists and has the correct profile details
    current_user = db.query(User).filter(User.id == 1).first()
    if not current_user:
        current_user = User(
            id=1,
            name="Active User",
            email="active.user@acme.com",
            role="Security Admin",
            storage="0.0 MB",
            files=0,
            last_login="Active now",
            status="active",
            mfa=True
        )
        db.add(current_user)
    else:
        current_user.name = "Active User"
        current_user.email = "active.user@acme.com"
        current_user.role = "Security Admin"
    db.commit()
