import csv
import io
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.audit import service
from src.auth.dependencies import require_admin
from src.database.core import get_db
from src.entities.user import User

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class AuditEventOut(BaseModel):
    id: uuid.UUID
    risk: str
    level: str
    user: str
    user_name: Optional[str]
    user_email: Optional[str]
    action: str
    resource: str
    resource_type: Optional[str]
    ip_address: Optional[str]
    device: Optional[str]
    location: Optional[str]
    created_at: Optional[datetime]


class RiskBreakdown(BaseModel):
    high: int
    medium: int
    low: int


class AuditStatsOut(BaseModel):
    total_events_24h: int
    total_events_change_pct: Optional[int]
    suspicious_events: int
    suspicious_events_24h: int
    access_denied: int
    downloads_24h: int
    risk_breakdown: RiskBreakdown
    suspicious_ips: list[str]


class BlockedIPOut(BaseModel):
    id: uuid.UUID
    ip_address: str
    reason: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class BlockIPRequest(BaseModel):
    ip_address: str = Field(min_length=3, max_length=45)
    reason: Optional[str] = None


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[AuditEventOut])
def list_events(
    risk: Optional[str] = Query(None, pattern="^(high|medium|low)$"),
    search: Optional[str] = Query(None, description="Match action, resource, IP, or user"),
    limit: int = Query(100, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Audit events enriched with user, derived device, location and risk tier."""
    return service.list_events(db, risk=risk, search=search, limit=limit, skip=skip)


@router.get("/stats", response_model=AuditStatsOut)
def get_stats(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Headline counters for the Access Monitoring cards and alert banner."""
    stats = service.get_stats(db)
    stats["suspicious_ips"] = service.suspicious_ips(db)
    return stats


@router.get("/export")
def export_events(
    risk: Optional[str] = Query(None, pattern="^(high|medium|low)$"),
    search: Optional[str] = Query(None),
    limit: int = Query(500, le=5000),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Download the current view as CSV."""
    events = service.list_events(db, risk=risk, search=search, limit=limit)

    cols = ["risk", "user", "action", "resource", "ip_address", "device", "location", "created_at"]
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=cols, extrasaction="ignore")
    writer.writeheader()
    for e in events:
        writer.writerow({**e, "created_at": e["created_at"].isoformat() if e["created_at"] else ""})

    stamp = datetime.now().strftime("%Y-%m-%d")
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="activity-logs-{stamp}.csv"'},
    )


@router.get("/blocked-ips", response_model=list[BlockedIPOut])
def list_blocked_ips(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    return service.list_blocked_ips(db)


@router.post("/blocked-ips", response_model=BlockedIPOut, status_code=status.HTTP_201_CREATED)
def block_ip(
    body: BlockIPRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return service.block_ip(db, admin, body.ip_address, body.reason)


@router.delete("/blocked-ips/{ip_address}", status_code=status.HTTP_204_NO_CONTENT)
def unblock_ip(
    ip_address: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service.unblock_ip(db, admin, ip_address)
