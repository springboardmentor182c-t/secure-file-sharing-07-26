import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends,Query, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field

from src.admin import service as admin_service
from src.database.core import get_db
from src.auth.dependencies import get_current_user, require_admin
from src.entities.user import User

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

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
    avatar_color: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    role: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None
    storage_quota: Optional[int] = None


class InviteUserRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    role: str = "member"
    plan: Optional[str] = "free"
    storage_quota: Optional[int] = None


class InviteUserResponse(BaseModel):
    user: UserAdminOut
    temp_password: str


class StatsOut(BaseModel):
    total_users: int
    new_users_30d: int
    active_users: int
    storage_total_bytes: int
    storage_used_bytes: int
    storage_used_pct: float
    mfa_enabled_count: int
    mfa_enabled_pct: int
    policy_violations: int


class RoleOut(BaseModel):
    key: str
    label: str
    permissions: list[str]
    user_count: int


class StorageBucketOut(BaseModel):
    label: str
    bytes: int
    files: int


class StorageUserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    used_bytes: int
    quota_bytes: int


class StorageOut(BaseModel):
    total_bytes: int
    used_bytes: int
    used_pct: float
    breakdown: list[StorageBucketOut]
    top_users: list[StorageUserOut]


class AuditLogOut(BaseModel):
    id: uuid.UUID
    created_at: Optional[datetime]
    admin_name: str
    admin_email: Optional[str]
    action: str
    target: str
    level: str
    result: str
    ip_address: Optional[str]


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Headline metrics for the admin panel stat cards."""
    return admin_service.get_stats(db)


# ── Routes ────────────────────────────────────────────────────────────────────
@router.get("/users", response_model=list[UserAdminOut])
def list_all_users(
    search: Optional[str] = Query(None, description="Match against name or email"),
    role: Optional[str] = Query(None),
    user_status: Optional[str] = Query(None, alias="status", pattern="^(active|suspended)$"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return admin_service.list_users(db, search=search, role=role, status=user_status)


@router.post("/users/invite", response_model=InviteUserResponse, status_code=status.HTTP_201_CREATED)
def invite_user(
    data: InviteUserRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create an account and return a one-time password for the admin to hand over."""
    user, temp_password = admin_service.invite_user(db, admin, data)
    return {"user": user, "temp_password": temp_password}


@router.patch("/users/{user_id}", response_model=UserAdminOut)
def update_user(
    user_id: uuid.UUID,
    data: UpdateUserRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin: update a user's role, plan, active status, or storage quota."""
    user = admin_service.update_user(db, admin, user_id, data)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return admin_service.delete_user(db, admin, user_id)


@router.get("/roles", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Role catalog with live user counts."""
    return admin_service.list_roles(db)


@router.get("/storage", response_model=StorageOut)
def get_storage(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Workspace quota, usage by file category, and the heaviest accounts."""
    return admin_service.get_storage(db)


@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    limit: int = Query(50, le=200),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return admin_service.list_audit_logs(db, limit=limit, skip=skip)
