# server/src/shares/controller.py

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Optional

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.shares.service import (
    ShareCreate,
    ShareOut,
    create_share,
    list_shares,
    revoke_share,
    access_share,
)

router = APIRouter()


def _get_client_ip(request: Request) -> str | None:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


@router.get("/", response_model=list[ShareOut])
def my_shares(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_shares(db, current_user.id)


@router.post("/", response_model=ShareOut, status_code=201)
def create(
    data: ShareCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ip = _get_client_ip(request)
    return create_share(db, data, current_user.id, ip_address=ip)


@router.delete("/{share_id}", status_code=204)
def revoke(
    share_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ip = _get_client_ip(request)
    revoke_share(db, share_id, current_user.id, ip_address=ip)


@router.get("/access/{token}", response_model=ShareOut)
def public_access(
    token: str,
    request: Request,
    password: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Public endpoint — no auth required. Validates token & optional password."""
    ip = _get_client_ip(request)
    return access_share(
        db,
        token,
        password=password,
        ip_address=ip,
        user_id=None,
    )