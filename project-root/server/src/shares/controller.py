# server/src/shares/controller.py

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from io import BytesIO
import os
from sqlalchemy.orm import Session
from typing import Optional

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.shares.service import (
    ShareCreate,
    ShareOut,
    PublicShareOut,
    create_share,
    list_shares,
    revoke_share,
    access_share,
    inspect_public_share,
    get_public_file_path,
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


@router.get("/public/{token}", response_model=PublicShareOut)
def public_details(
    token: str,
    password: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return safe file metadata without consuming a link view."""
    return inspect_public_share(db, token, password=password)


@router.get("/public/{token}/content")
def public_content(
    token: str,
    request: Request,
    password: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Stream a validated public share and consume one allowed view."""
    path, original_name, mimetype, permission = get_public_file_path(
        db,
        token,
        password=password,
        ip_address=_get_client_ip(request),
    )
    try:
        with open(path, "rb") as file:
            data = file.read()
        disposition = "attachment" if permission == "download" else "inline"
        return StreamingResponse(
            BytesIO(data),
            media_type=mimetype or "application/octet-stream",
            headers={"Content-Disposition": f'{disposition}; filename="{original_name}"'},
        )
    finally:
        if os.path.exists(path):
            os.remove(path)
