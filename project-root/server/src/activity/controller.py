from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.activity.models import ActivityResponse
from src.activity.service import get_user_activities
from src.auth.dependencies import get_current_user
from src.database.core import get_db
from src.entities.user import User


router = APIRouter()


@router.get("/", response_model=list[ActivityResponse])
def list_activities(
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return only the authenticated user's audit activity."""
    return get_user_activities(db, current_user.id, limit)


@router.get("/user/{user_id}", response_model=list[ActivityResponse])
def list_user_activities(
    user_id: int,
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retain the legacy route for owners and administrators only."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot view another user's activity.",
        )
    return get_user_activities(db, user_id, limit)
