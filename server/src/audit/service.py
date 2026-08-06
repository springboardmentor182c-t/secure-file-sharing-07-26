"""Access-monitoring logic — enriched audit events, headline stats, IP blocklist."""

import ipaddress
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, Request
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from src.entities.audit_log import AuditLog
from src.entities.blocked_ip import BlockedIP
from src.entities.user import User

# ── Risk model ───────────────────────────────────────────────────────────────
# The table stores a `level`; the Access Monitoring screen speaks in risk tiers.
RISK_BY_LEVEL = {
    "error": "high",
    "critical": "high",
    "warn": "medium",
    "warning": "medium",
}
LEVELS_BY_RISK = {
    "high": ("error", "critical"),
    "medium": ("warn", "warning"),
    "low": ("info", "success", "debug"),
}

DENIED_PATTERN = re.compile(r"denied|forbidden|unauthor|failed|reject", re.I)
DOWNLOAD_PATTERN = re.compile(r"download", re.I)


def risk_of(level: Optional[str]) -> str:
    return RISK_BY_LEVEL.get((level or "info").lower(), "low")


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── Device / location derivation ─────────────────────────────────────────────

_OS_PATTERNS = [
    ("Windows",  re.compile(r"Windows NT", re.I)),
    ("macOS",    re.compile(r"Mac OS X|Macintosh", re.I)),
    ("iOS",      re.compile(r"iPhone|iPad", re.I)),
    ("Android",  re.compile(r"Android", re.I)),
    ("Ubuntu",   re.compile(r"Ubuntu", re.I)),
    ("Linux",    re.compile(r"Linux", re.I)),
]
_BROWSER_PATTERNS = [
    ("Edge",     re.compile(r"Edg/", re.I)),
    ("Opera",    re.compile(r"OPR/|Opera", re.I)),
    ("Chrome",   re.compile(r"Chrome/", re.I)),
    ("Firefox",  re.compile(r"Firefox/", re.I)),
    ("Safari",   re.compile(r"Safari/", re.I)),
]


def device_of(user_agent: Optional[str]) -> Optional[str]:
    """Turn a raw UA string into something like 'Windows · Chrome'."""
    if not user_agent:
        return None

    os_name = next((name for name, rx in _OS_PATTERNS if rx.search(user_agent)), None)
    # Order matters: Edge/Opera also claim "Chrome", Chrome also claims "Safari".
    browser = next((name for name, rx in _BROWSER_PATTERNS if rx.search(user_agent)), None)

    if os_name and browser:
        return f"{os_name} · {browser}"
    return os_name or browser or "Unknown"


def location_of(ip: Optional[str]) -> Optional[str]:
    """Classify an address without calling out to a geo-IP service.

    We deliberately do not invent a city/country — there is no geolocation
    provider wired up, and a fabricated location in an audit trail is worse
    than an honest one.
    """
    if not ip:
        return None
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return None

    if addr.is_loopback:
        return "Localhost"
    if addr.is_private:
        return "Local network"
    return "External"


# ── Recording ────────────────────────────────────────────────────────────────

def record_event(
    db: Session,
    user_id: Optional[uuid.UUID],
    action: str,
    *,
    request: Optional[Request] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    resource_name: Optional[str] = None,
    level: str = "info",
    commit: bool = True,
) -> AuditLog:
    """Write an audit row, capturing IP and user-agent from the request if given."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        resource_name=resource_name,
        level=level,
        ip_address=(request.client.host if request and request.client else None),
        user_agent=(request.headers.get("user-agent") if request else None),
    )
    db.add(log)
    if commit:
        db.commit()
        db.refresh(log)
    return log


# ── Querying ─────────────────────────────────────────────────────────────────

def _serialize(log: AuditLog, name: Optional[str], email: Optional[str]) -> dict:
    return {
        "id": log.id,
        "risk": risk_of(log.level),
        "level": log.level or "info",
        "user": email or name or "System",
        "user_name": name,
        "user_email": email,
        "action": log.action,
        "resource": log.resource_name or log.resource_type or "—",
        "resource_type": log.resource_type,
        "ip_address": log.ip_address,
        "device": device_of(log.user_agent),
        "location": location_of(log.ip_address),
        "created_at": log.created_at,
    }


def list_events(
    db: Session,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
) -> list[dict]:
    q = (
        db.query(AuditLog, User.name, User.email)
        .outerjoin(User, AuditLog.user_id == User.id)
    )

    if risk:
        levels = LEVELS_BY_RISK.get(risk.lower())
        if not levels:
            raise HTTPException(status_code=400, detail="risk must be high, medium or low")
        q = q.filter(func.lower(AuditLog.level).in_(levels))

    if search:
        term = f"%{search.strip().lower()}%"
        q = q.filter(
            or_(
                func.lower(AuditLog.action).like(term),
                func.lower(AuditLog.resource_name).like(term),
                func.lower(AuditLog.ip_address).like(term),
                func.lower(User.email).like(term),
                func.lower(User.name).like(term),
            )
        )

    rows = q.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [_serialize(log, name, email) for log, name, email in rows]


def get_stats(db: Session) -> dict:
    """The four headline cards on the Access Monitoring screen."""
    day_ago = _now() - timedelta(hours=24)
    prev_day = _now() - timedelta(hours=48)

    total_24h = (
        db.query(func.count(AuditLog.id)).filter(AuditLog.created_at >= day_ago).scalar() or 0
    )
    prev_24h = (
        db.query(func.count(AuditLog.id))
        .filter(AuditLog.created_at >= prev_day, AuditLog.created_at < day_ago)
        .scalar()
        or 0
    )

    suspicious = (
        db.query(func.count(AuditLog.id))
        .filter(func.lower(AuditLog.level).in_(LEVELS_BY_RISK["high"]))
        .scalar()
        or 0
    )
    suspicious_24h = (
        db.query(func.count(AuditLog.id))
        .filter(func.lower(AuditLog.level).in_(LEVELS_BY_RISK["high"]))
        .filter(AuditLog.created_at >= day_ago)
        .scalar()
        or 0
    )

    # SQLite has no regex, so denial/download matching happens in Python over
    # the distinct action strings rather than in SQL.
    actions = [a for (a,) in db.query(AuditLog.action).distinct().all() if a]
    denied_actions = [a for a in actions if DENIED_PATTERN.search(a)]
    download_actions = [a for a in actions if DOWNLOAD_PATTERN.search(a)]

    denied = (
        db.query(func.count(AuditLog.id)).filter(AuditLog.action.in_(denied_actions)).scalar() or 0
    ) if denied_actions else 0

    downloads_24h = (
        db.query(func.count(AuditLog.id))
        .filter(AuditLog.action.in_(download_actions), AuditLog.created_at >= day_ago)
        .scalar()
        or 0
    ) if download_actions else 0

    def pct_change(now: int, before: int) -> Optional[int]:
        if not before:
            return None
        return round((now - before) / before * 100)

    return {
        "total_events_24h": total_24h,
        "total_events_change_pct": pct_change(total_24h, prev_24h),
        "suspicious_events": suspicious,
        "suspicious_events_24h": suspicious_24h,
        "access_denied": denied,
        "downloads_24h": downloads_24h,
        "risk_breakdown": {
            "high": suspicious,
            "medium": db.query(func.count(AuditLog.id))
            .filter(func.lower(AuditLog.level).in_(LEVELS_BY_RISK["medium"]))
            .scalar()
            or 0,
            "low": db.query(func.count(AuditLog.id))
            .filter(func.lower(AuditLog.level).in_(LEVELS_BY_RISK["low"]))
            .scalar()
            or 0,
        },
    }


def suspicious_ips(db: Session) -> list[str]:
    """Distinct addresses behind high-risk events — what the banner offers to block."""
    rows = (
        db.query(AuditLog.ip_address)
        .filter(func.lower(AuditLog.level).in_(LEVELS_BY_RISK["high"]))
        .filter(AuditLog.ip_address.isnot(None))
        .distinct()
        .all()
    )
    return [ip for (ip,) in rows if ip]


# ── Blocklist ────────────────────────────────────────────────────────────────

def list_blocked_ips(db: Session) -> list[BlockedIP]:
    return db.query(BlockedIP).order_by(BlockedIP.created_at.desc()).all()


def block_ip(db: Session, admin: User, ip: str, reason: Optional[str] = None) -> BlockedIP:
    ip = (ip or "").strip()
    try:
        ipaddress.ip_address(ip)
    except ValueError:
        raise HTTPException(status_code=400, detail="Not a valid IP address")

    existing = db.query(BlockedIP).filter(BlockedIP.ip_address == ip).first()
    if existing:
        raise HTTPException(status_code=409, detail="That IP is already blocked")

    entry = BlockedIP(ip_address=ip, reason=reason, blocked_by=admin.id)
    db.add(entry)
    db.add(
        AuditLog(
            user_id=admin.id, action="Blocked IP address", resource_type="ip",
            resource_name=ip, level="warn",
        )
    )
    db.commit()
    db.refresh(entry)
    return entry


def unblock_ip(db: Session, admin: User, ip: str) -> None:
    entry = db.query(BlockedIP).filter(BlockedIP.ip_address == ip).first()
    if not entry:
        raise HTTPException(status_code=404, detail="That IP is not blocked")

    db.delete(entry)
    db.add(
        AuditLog(
            user_id=admin.id, action="Unblocked IP address", resource_type="ip",
            resource_name=ip, level="info",
        )
    )
    db.commit()


def is_blocked(db: Session, ip: Optional[str]) -> bool:
    if not ip:
        return False
    return db.query(BlockedIP).filter(BlockedIP.ip_address == ip).first() is not None
