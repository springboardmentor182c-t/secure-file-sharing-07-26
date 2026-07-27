import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.database.core import get_db
from src.auth.dependencies import get_current_user, require_admin
from src.entities.user import User
from src.users import service

router = APIRouter()


# ── Pydantic ──────────────────────────────────────────────────────────────────
class UserAdminOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    plan: str
    is_active: bool
    mfa_enabled: bool
    storage_used: int
    storage_quota: int
    avatar_color: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    role: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None
    storage_quota: Optional[int] = None


# ── Routes ────────────────────────────────────────────────────────────────────
@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: list all users."""
    return service.list_users(db)


@router.patch("/users/{user_id}", response_model=UserAdminOut)
def update_user(
    user_id: uuid.UUID,
    body: UpdateUserRequest,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: update a user's role, plan, active status, or storage quota."""
    user = service.update_user(
        db, user_id,
        role=body.role,
        plan=body.plan,
        is_active=body.is_active,
        storage_quota=body.storage_quota,
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
