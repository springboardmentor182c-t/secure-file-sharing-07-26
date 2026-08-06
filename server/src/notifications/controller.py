import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.notifications import service


router = APIRouter()


# ── Pydantic models ───────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MarkReadResponse(BaseModel):
    updated: int


# ── Routes ────────────────────────────────────────────────────────────────────
@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all notifications for the authenticated user, newest first."""
    return service.list_notifications(db, current_user)


@router.patch("/{notif_id}/read", response_model=NotificationOut)
def mark_read(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    n = service.mark_read(db, notif_id, current_user)
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return n


@router.patch("/read-all", response_model=MarkReadResponse)
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = service.mark_all_read(db, current_user)
    return MarkReadResponse(updated=count)


@router.delete("/{notif_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ok = service.delete_notification(db, notif_id, current_user)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
