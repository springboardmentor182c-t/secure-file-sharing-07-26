import secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.entities.share_link import ShareLink
from src.entities.file import File
from src.entities.audit_log import AuditLog
from src.auth.dependencies import hash_password, verify_password
from pydantic import BaseModel
from typing import Optional


class ShareCreate(BaseModel):
    file_id: int
    permission: str = "view"
    expires_at: Optional[datetime] = None
    password: Optional[str] = None
    max_views: Optional[int] = None


class ShareOut(BaseModel):
    id: int
    file_id: int
    token: str
    permission: str
    expires_at: Optional[datetime]
    access_count: int
    max_views: Optional[int]
    is_active: bool
    created_at: datetime
    link: str

    class Config:
        from_attributes = True


def _build_link(token: str) -> str:
    return f"https://trust.sh/s/{token}"


def create_share(db: Session, data: ShareCreate, user_id: int) -> ShareOut:
    # Verify file ownership
    file = db.query(File).filter(File.id == data.file_id, File.is_deleted == False).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    token = secrets.token_urlsafe(12)
    share = ShareLink(
        file_id=data.file_id,
        token=token,
        permission=data.permission,
        expires_at=data.expires_at,
        password_hash=hash_password(data.password) if data.password else None,
        max_views=data.max_views,
        created_by=user_id,
    )
    db.add(share)

    log = AuditLog(user_id=user_id, action="SHARE", resource_type="file",
                   resource_id=data.file_id, resource_name=file.original_name, level="info")
    db.add(log)
    db.commit()
    db.refresh(share)
    return _to_out(share)


def list_shares(db: Session, user_id: int) -> list[ShareOut]:
    shares = (
        db.query(ShareLink)
        .join(File, ShareLink.file_id == File.id)
        .filter(ShareLink.created_by == user_id)
        .order_by(ShareLink.created_at.desc())
        .all()
    )
    return [_to_out(s) for s in shares]


def revoke_share(db: Session, share_id: int, user_id: int) -> None:
    share = db.query(ShareLink).filter(ShareLink.id == share_id, ShareLink.created_by == user_id).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    share.is_active = False
    log = AuditLog(user_id=user_id, action="REVOKE_SHARE", resource_type="share_link",
                   resource_id=share_id, level="warn")
    db.add(log)
    db.commit()


def access_share(db: Session, token: str, password: str | None = None) -> ShareOut:
    share = db.query(ShareLink).filter(ShareLink.token == token, ShareLink.is_active == True).first()
    if not share:
        raise HTTPException(status_code=404, detail="Share link not found or revoked")
    if share.expires_at and share.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Share link has expired")
    if share.max_views and share.access_count >= share.max_views:
        raise HTTPException(status_code=410, detail="Share link view limit reached")
    if share.password_hash:
        if not password or not verify_password(password, share.password_hash):
            raise HTTPException(status_code=401, detail="Invalid share password")
    share.access_count += 1
    db.commit()
    return _to_out(share)


def _to_out(share: ShareLink) -> ShareOut:
    return ShareOut(
        id=share.id,
        file_id=share.file_id,
        token=share.token,
        permission=share.permission,
        expires_at=share.expires_at,
        access_count=share.access_count,
        max_views=share.max_views,
        is_active=share.is_active,
        created_at=share.created_at,
        link=_build_link(share.token),
    )
