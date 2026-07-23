# server/src/shares/service.py

import secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional

from src.entities.share_link import ShareLink
from src.entities.file import File
from src.entities.audit_log import AuditLog
from src.auth.dependencies import hash_password, verify_password

from src.analytics.services import log_event
from src.analytics.constants import (
    AnalyticsEventType,
    AnalyticsEventStatus,
)


# ═══════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════════════════════════
# CREATE SHARE
# ═══════════════════════════════════════════════════════════════════════════

def create_share(
    db: Session,
    data: ShareCreate,
    user_id: int,
    ip_address: str | None = None,
) -> ShareOut:
    # Verify file ownership
    file = (
        db.query(File)
        .filter(
            File.id == data.file_id,
            File.owner_id == user_id,
            File.is_deleted == False,
        )
        .first()
    )
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

    log = AuditLog(
        user_id=user_id,
        action="SHARE",
        resource_type="file",
        resource_id=data.file_id,
        resource_name=file.original_name,
        level="info",
    )
    db.add(log)
    db.commit()
    db.refresh(share)

    # ── Log SHARE analytics event ──────────────────────────────────────────
    log_event(
        db,
        event_type=AnalyticsEventType.SHARE,
        user_id=user_id,
        file_id=data.file_id,
        share_link_id=share.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "target": file.original_name,
            "permission": data.permission,
        },
    )
    db.commit()

    return _to_out(share)


# ═══════════════════════════════════════════════════════════════════════════
# LIST SHARES
# ═══════════════════════════════════════════════════════════════════════════

def list_shares(db: Session, user_id: int) -> list[ShareOut]:
    shares = (
        db.query(ShareLink)
        .join(File, ShareLink.file_id == File.id)
        .filter(ShareLink.created_by == user_id)
        .order_by(ShareLink.created_at.desc())
        .all()
    )
    return [_to_out(s) for s in shares]


# ═══════════════════════════════════════════════════════════════════════════
# REVOKE SHARE
# ═══════════════════════════════════════════════════════════════════════════

def revoke_share(
    db: Session,
    share_id: int,
    user_id: int,
    ip_address: str | None = None,
) -> None:
    share = (
        db.query(ShareLink)
        .filter(
            ShareLink.id == share_id,
            ShareLink.created_by == user_id,
        )
        .first()
    )
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")

    share.is_active = False

    log = AuditLog(
        user_id=user_id,
        action="REVOKE_SHARE",
        resource_type="share_link",
        resource_id=share_id,
        level="warn",
    )
    db.add(log)
    db.commit()

    # ── Log SECURITY event for share revocation ────────────────────────────
    log_event(
        db,
        event_type=AnalyticsEventType.SECURITY,
        user_id=user_id,
        file_id=share.file_id,
        share_link_id=share_id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "severity_key": "admin_role",
            "label": "Share link revoked",
            "detail": f"Share link {share_id} was revoked by owner",
            "target": f"share_link_{share_id}",
            "attempts": 1,
        },
    )
    db.commit()


# ═══════════════════════════════════════════════════════════════════════════
# ACCESS SHARE
# ═══════════════════════════════════════════════════════════════════════════

def access_share(
    db: Session,
    token: str,
    password: str | None = None,
    ip_address: str | None = None,
    user_id: int | None = None,
) -> ShareOut:
    share = (
        db.query(ShareLink)
        .filter(ShareLink.token == token, ShareLink.is_active == True)
        .first()
    )

    # ── Share not found or revoked ─────────────────────────────────────────
    if not share:
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=user_id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "external_link",
                "label": "Invalid share link accessed",
                "detail": f"Attempted access with unknown token",
                "target": token[:12],
                "attempts": 1,
            },
        )
        db.commit()
        raise HTTPException(
            status_code=404,
            detail="Share link not found or revoked",
        )

    # ── Expired ─────────────────────────────────────────────────────────────
    if share.expires_at and share.expires_at < datetime.now(timezone.utc):
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=user_id,
            file_id=share.file_id,
            share_link_id=share.id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "external_link",
                "label": "Expired share link accessed",
                "detail": f"Share link {share.id} was accessed after expiry",
                "target": f"share_link_{share.id}",
                "attempts": 1,
            },
        )
        db.commit()
        raise HTTPException(status_code=410, detail="Share link has expired")

    # ── View limit reached ─────────────────────────────────────────────────
    if share.max_views is not None and share.access_count >= share.max_views:
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=user_id,
            file_id=share.file_id,
            share_link_id=share.id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "external_link",
                "label": "Share link view limit reached",
                "detail": f"Share link {share.id} view limit exceeded",
                "target": f"share_link_{share.id}",
                "attempts": share.access_count,
            },
        )
        db.commit()
        raise HTTPException(
            status_code=410,
            detail="Share link view limit reached",
        )

    # ── Invalid password ───────────────────────────────────────────────────
    if share.password_hash:
        if not password or not verify_password(password, share.password_hash):
            log_event(
                db,
                event_type=AnalyticsEventType.SECURITY,
                user_id=user_id,
                file_id=share.file_id,
                share_link_id=share.id,
                status=AnalyticsEventStatus.FAILED,
                ip_address=ip_address,
                event_metadata={
                    "severity_key": "brute_force",
                    "label": "Invalid share password",
                    "detail": f"Wrong password for share link {share.id}",
                    "target": f"share_link_{share.id}",
                    "attempts": 1,
                },
            )
            db.commit()
            raise HTTPException(
                status_code=401,
                detail="Invalid share password",
            )

    # ── Successful access ──────────────────────────────────────────────────
    share.access_count += 1
    db.commit()

    log_event(
        db,
        event_type=AnalyticsEventType.SHARE,
        user_id=user_id,
        file_id=share.file_id,
        share_link_id=share.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "action": "share_accessed",
            "target": f"share_link_{share.id}",
        },
    )
    db.commit()

    return _to_out(share)


# ═══════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════

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