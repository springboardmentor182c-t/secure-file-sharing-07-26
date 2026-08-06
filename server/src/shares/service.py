import uuid
import secrets
from datetime import datetime, timezone, date
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src.entities.share_link import ShareLink
from src.entities.file import File
from src.entities.user import User
from src.notifications.service import create_notification
from src.shares.email_service import send_secure_share_email

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _format_bytes(size: int = 0) -> str:
    if not size or size <= 0:
        return "0 B"
    units = ["B", "KB", "MB", "GB"]
    i = 0
    s = float(size)
    while s >= 1024 and i < len(units) - 1:
        s /= 1024.0
        i += 1
    return f"{s:.1f} {units[i]}"


def list_shares(db: Session, user: User) -> list[tuple[ShareLink, str]]:
    """Returns list of (ShareLink, file_name) tuples."""
    results = (
        db.query(ShareLink, File.original_name)
        .join(File, ShareLink.file_id == File.id)
        .filter(ShareLink.owner_id == user.id, ShareLink.is_active == True)  # noqa: E712
        .order_by(ShareLink.created_at.desc())
        .all()
    )
    return results


def create_share(
    db: Session,
    user: User,
    file_id: uuid.UUID,
    expires_at: datetime | str | None = None,
    password: str | None = None,
    max_access: int | None = None,
    permission: str = "view",
    recipient_email: str | None = None,
    recipient_emails: list[str] | None = None,
    frontend_url: str = "http://localhost:3000",
) -> tuple[ShareLink | None, str | None]:
    # Verify file ownership
    file = db.query(File).filter(File.id == file_id, File.owner_id == user.id).first()
    if not file:
        return None, None

    # Handle string ISO dates safely
    if isinstance(expires_at, str) and expires_at.strip():
        try:
            expires_at = datetime.fromisoformat(expires_at.strip())
        except Exception:
            expires_at = None

    # Handle recipient emails list or string
    rec_list = []
    if recipient_emails:
        rec_list = [e.strip() for e in recipient_emails if e.strip()]
    elif recipient_email:
        rec_list = [e.strip() for e in recipient_email.split(",") if e.strip()]

    final_recipients_str = ", ".join(rec_list) if rec_list else None

    token = secrets.token_urlsafe(24)
    pw_hash = pwd_context.hash(password) if password else None

    link = ShareLink(
        file_id=file_id,
        owner_id=user.id,
        token=token,
        password_hash=pw_hash,
        expires_at=expires_at,
        max_access=max_access,
        permission=permission or "view",
        recipient_email=final_recipients_str,
    )
    db.add(link)
    db.commit()
    db.refresh(link)

    # Dispatch email notification if recipients are specified
    if rec_list:
        share_url = f"{frontend_url}/share/{token}"
        expires_str = expires_at.strftime("%b %d, %Y") if (expires_at and hasattr(expires_at, "strftime")) else "Never (No Expiration)"
        file_size_str = _format_bytes(file.size or 0)
        sender_addr = getattr(user, "email", "Owner")

        send_secure_share_email(
            recipient_emails=rec_list,
            sender_email=sender_addr,
            file_name=file.original_name,
            file_size_str=file_size_str,
            share_url=share_url,
            permission=permission or "view",
            expires_at_str=expires_str,
            has_password=bool(password),
            max_downloads=max_access,
        )

        # Also create an in-app audit notification for owner
        create_notification(
            db=db,
            user_id=user.id,
            title="Secure Email Sent",
            message=f"Shared '{file.original_name}' with {final_recipients_str} ({permission.upper()} permission).",
            type="info",
        )

    return link, file.original_name


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
