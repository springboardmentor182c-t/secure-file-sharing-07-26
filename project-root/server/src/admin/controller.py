from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from src.database.core import get_db
from src.auth.dependencies import require_admin
from src.entities.user import User

router = APIRouter()


class UserAdminOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    plan: str
    is_active: bool
    mfa_enabled: bool
    storage_used: int
    storage_quota: int
    created_at: Optional[str]

    class Config:
        from_attributes = True


class UpdateUserRole(BaseModel):
    role: str
    plan: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/users", response_model=list[UserAdminOut])
def list_all_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserAdminOut(
            id=u.id, name=u.name, email=u.email, role=u.role, plan=u.plan,
            is_active=u.is_active, mfa_enabled=u.mfa_enabled,
            storage_used=u.storage_used or 0, storage_quota=u.storage_quota or 5368709120,
            created_at=str(u.created_at) if u.created_at else None,
        )
        for u in users
    ]


@router.patch("/users/{user_id}", response_model=UserAdminOut)
def update_user(
    user_id: int,
    data: UpdateUserRole,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own account via admin panel")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.role:
        user.role = data.role
    if data.plan is not None:
        user.plan = data.plan
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return UserAdminOut(
        id=user.id, name=user.name, email=user.email, role=user.role, plan=user.plan,
        is_active=user.is_active, mfa_enabled=user.mfa_enabled,
        storage_used=user.storage_used or 0, storage_quota=user.storage_quota or 5368709120,
        created_at=str(user.created_at) if user.created_at else None,
    )
