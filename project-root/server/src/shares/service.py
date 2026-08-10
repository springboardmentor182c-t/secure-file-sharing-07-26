import uuid
import secrets
from pathlib import Path
from datetime import datetime, timezone, date
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from src.entities.share_link import ShareLink
from src.entities.file import File
from src.entities.user import User
from src.entities.audit_log import AuditLog
from src.notifications.service import create_notification
from src.shares.email_service import send_secure_share_email
from src.folders.service import get_folder_path_on_disk
from src.realtime.manager import emit_sync

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _audit(
    db: Session,
    user_id: uuid.UUID,
    action: str,
    resource_name: str,
    resource_id: uuid.UUID | str = None,
    level: str = "info",
) -> None:
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type="share",
        resource_id=str(resource_id) if resource_id else None,
        resource_name=resource_name,
        level=level,
    )
    db.add(log)


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

        # Notify any registered users among recipients in real-time
        try:
            recipient_users = db.query(User).filter(User.email.in_(rec_list)).all()
            for r_user in recipient_users:
                create_notification(
                    db=db,
                    user_id=r_user.id,
                    title="File Shared With You",
                    message=f"{sender_addr} shared '{file.original_name}' with you ({permission.upper()} access).",
                    type="share",
                )
                emit_sync(r_user.id, "share_received", {
                    "share_id": str(link.id),
                    "file_id": str(file.id),
                    "file_name": file.original_name,
                    "sender_email": sender_addr,
                    "permission": link.permission,
                    "share_url": share_url,
                    "token": link.token,
                    "expires_at": link.expires_at.isoformat() if link.expires_at else None,
                    "has_password": bool(password),
                    "created_at": link.created_at.isoformat() if link.created_at else None,
                })
        except Exception:
            pass

        # Emit email_share_sent confirmation to owner
        emit_sync(user.id, "email_share_sent", {
            "share_id": str(link.id),
            "file_id": str(file.id),
            "file_name": file.original_name,
            "recipients": rec_list,
            "permission": link.permission,
            "token": link.token,
            "share_url": share_url,
            "expires_at": link.expires_at.isoformat() if link.expires_at else None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    # Real-time event to owner
    emit_sync(user.id, "share_created", {
        "share_id": str(link.id),
        "file_id": str(file.id),
        "file_name": file.original_name,
        "permission": link.permission,
        "token": link.token,
        "expires_at": link.expires_at.isoformat() if link.expires_at else None,
        "recipient_email": link.recipient_email,
        "created_at": link.created_at.isoformat() if link.created_at else None,
    })

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

    # Real-time event to owner
    emit_sync(user.id, "share_revoked", {
        "share_id": str(share_id),
    })

    return True


def access_share(db: Session, token: str, password: str | None = None) -> tuple[ShareLink | None, str | None]:
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

    # Fetch file for notifications
    file = db.query(File).filter(File.id == link.file_id).first()
    fname = file.original_name if file else "Shared File"

    # Real-time event to owner
    emit_sync(link.owner_id, "share_accessed", {
        "share_id": str(link.id),
        "file_id": str(link.file_id),
        "file_name": fname,
        "token": link.token,
        "access_count": link.access_count,
        "permission": link.permission,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Also notify owner of the access
    try:
        create_notification(
            db=db,
            user_id=link.owner_id,
            title="Shared File Accessed",
            message=f"A recipient accessed your shared file '{fname}' (Access #{link.access_count}).",
            type="info",
        )
    except Exception:
        pass

    return link, None


def get_share_info(db: Session, token: str) -> dict | None:
    link = db.query(ShareLink).filter(
        ShareLink.token == token,
        ShareLink.is_active == True,  # noqa: E712
    ).first()
    if not link:
        return None

    file = db.query(File).filter(File.id == link.file_id, File.is_deleted == False).first()
    if not file:
        return None

    is_expired = False
    if link.expires_at:
        exp = link.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > exp:
            is_expired = True

    is_limit_reached = False
    if link.max_access and link.access_count >= link.max_access:
        is_limit_reached = True

    owner = db.query(User).filter(User.id == file.owner_id).first()
    owner_email = owner.email if owner else None

    return {
        "id": link.id,
        "token": link.token,
        "file_id": link.file_id,
        "file_name": file.original_name,
        "size_bytes": file.size or 0,
        "mimetype": file.mimetype or "application/octet-stream",
        "has_password": link.password_hash is not None,
        "permission": getattr(link, "permission", "view") or "view",
        "expires_at": link.expires_at,
        "access_count": link.access_count or 0,
        "max_access": link.max_access,
        "is_active": link.is_active,
        "is_expired": is_expired,
        "is_limit_reached": is_limit_reached,
        "is_encrypted": file.encrypted,
        "owner_email": owner_email,
        "created_at": link.created_at,
    }


def get_shared_file_download(
    db: Session, token: str, password: str | None = None
) -> tuple[Path, str, bool, str]:
    """
    Validates token, expiry, max_access, and password,
    increments access_count, and returns (disk_path, original_name, is_encrypted, mimetype).
    """
    link, err = access_share(db, token, password)
    if err or not link:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=err or "Access denied")

    file = db.query(File).filter(File.id == link.file_id, File.is_deleted == False).first()
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    folder_path = get_folder_path_on_disk(db, file.folder_id)
    path = folder_path / file.stored_name
    if not path.exists():
        # Fallback to general uploads if not in folder
        fallback_path = Path("uploads") / file.stored_name
        if fallback_path.exists():
            path = fallback_path
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File data not found on disk")

    _audit(db, link.owner_id, "SHARE_DOWNLOAD", f"{file.original_name} via token {token[:8]}...", resource_id=file.id, level="info")
    db.commit()
    return path, file.original_name, file.encrypted, file.mimetype or "application/octet-stream"

