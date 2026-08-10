import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.database.core import get_db
from src.entities.user import User
from src.notifications import service
from src.notifications.models import (
    MarkReadResponse,
    NotificationCreate,
    NotificationOut,
    NotificationSummary,
)

router = APIRouter()


def _validated_type(value: str | None) -> str | None:
    """Reject unknown filter categories instead of silently returning nothing."""
    if value is None:
        return None
    if value not in service.NOTIFICATION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown notification type '{value}'. "
                   f"Expected one of: {', '.join(service.NOTIFICATION_TYPES)}",
        )
    return value


# ── Reads ─────────────────────────────────────────────────────────────────────
@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    type: str | None = Query(None, description="Filter by category, e.g. 'share'"),
    unread_only: bool = Query(False, description="Return only unread notifications"),
    limit: int = Query(service.DEFAULT_LIMIT, ge=1, le=service.MAX_LIMIT),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Notifications for the authenticated user, newest first."""
    return service.list_notifications(
        db,
        current_user,
        type=_validated_type(type),
        unread_only=unread_only,
        limit=limit,
        offset=offset,
    )


@router.get("/summary", response_model=NotificationSummary)
def summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Totals and per-category unread counts — drives the header and sidebar badge."""
    return NotificationSummary(**service.summarize(db, current_user))


# ── Writes ────────────────────────────────────────────────────────────────────
@router.post("/", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Raise a notification for the authenticated user."""
    return service.create_notification(
        db,
        user_id=current_user.id,
        title=payload.title,
        message=payload.message,
        type=payload.type,
    )


@router.patch("/read-all", response_model=MarkReadResponse)
def mark_all_read(
    type: str | None = Query(None, description="Limit to a single category"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = service.mark_all_read(db, current_user, type=_validated_type(type))
    return MarkReadResponse(updated=count)


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


@router.delete("/", response_model=MarkReadResponse)
def clear_notifications(
    read_only: bool = Query(False, description="Delete only notifications already read"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = service.clear_notifications(db, current_user, read_only=read_only)
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
