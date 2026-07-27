import uuid
import secrets
from datetime import datetime, timezone
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src.entities.share_link import ShareLink
from src.entities.file import File
from src.entities.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def list_shares(db: Session, user: User) -> list[ShareLink]:
    return (
        db.query(ShareLink)
        .filter(ShareLink.owner_id == user.id, ShareLink.is_active == True)  # noqa: E712
        .order_by(ShareLink.created_at.desc())
        .all()
    )


def create_share(
    db: Session,
    user: User,
    file_id: uuid.UUID,
    expires_at: datetime | None,
    password: str | None,
    max_access: int | None,
) -> ShareLink:
    # Verify file ownership
    file = db.query(File).filter(File.id == file_id, File.owner_id == user.id).first()
    if not file:
        return None

    token = secrets.token_urlsafe(24)
    pw_hash = pwd_context.hash(password) if password else None

    link = ShareLink(
        file_id=file_id,
        owner_id=user.id,
        token=token,
        password_hash=pw_hash,
        expires_at=expires_at,
        max_access=max_access,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def revoke_share(db: Session, share_id: uuid.UUID, user: User) -> bool:
    link = db.query(ShareLink).filter(
        ShareLink.id == share_id,
        ShareLink.owner_id == user.id,
    ).first()
    if not link:
        return False
    link.is_active = False
    db.commit()
    return True


def access_share(db: Session, token: str, password: str | None) -> tuple[ShareLink | None, str | None]:
    """Returns (share_link, error_message). On success error is None."""
    link = db.query(ShareLink).filter(
        ShareLink.token == token,
        ShareLink.is_active == True,  # noqa: E712
    ).first()
    if not link:
        return None, "Share link not found or revoked"

    if link.expires_at:
        exp = link.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > exp:
            return None, "Share link has expired"

    if link.max_access and link.access_count >= link.max_access:
        return None, "Access limit reached"

    if link.password_hash:
        if not password or not pwd_context.verify(password, link.password_hash):
            return None, "Invalid password"

    # Record access
    link.access_count += 1
    db.commit()
    db.refresh(link)
    return link, None
