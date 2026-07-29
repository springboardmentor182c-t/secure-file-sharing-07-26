import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.shares import service

router = APIRouter()


# ── Pydantic models ───────────────────────────────────────────────────────────
class ShareOut(BaseModel):
    id: uuid.UUID
    file_id: uuid.UUID
    token: str
    has_password: bool
    expires_at: Optional[datetime]
    access_count: int
    max_access: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_ext(cls, obj):
        return cls(
            id=obj.id,
            file_id=obj.file_id,
            token=obj.token,
            has_password=obj.password_hash is not None,
            expires_at=obj.expires_at,
            access_count=obj.access_count,
            max_access=obj.max_access,
            is_active=obj.is_active,
            created_at=obj.created_at,
        )


class CreateShareRequest(BaseModel):
    file_id: uuid.UUID
    expires_at: Optional[datetime] = None
    password: Optional[str] = None
    max_access: Optional[int] = None


class AccessShareResponse(BaseModel):
    file_id: uuid.UUID
    access_count: int


# ── Routes ────────────────────────────────────────────────────────────────────
@router.get("/", response_model=list[ShareOut])
def list_shares(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    links = service.list_shares(db, current_user)
    return [ShareOut.from_orm_ext(l) for l in links]


@router.post("/", response_model=ShareOut, status_code=status.HTTP_201_CREATED)
def create_share(
    body: CreateShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    link = service.create_share(
        db, current_user,
        file_id=body.file_id,
        expires_at=body.expires_at,
        password=body.password,
        max_access=body.max_access,
    )
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found or not yours")
    return ShareOut.from_orm_ext(link)


@router.delete("/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_share(
    share_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ok = service.revoke_share(db, share_id, current_user)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share not found")


@router.get("/access/{token}", response_model=AccessShareResponse)
def access_share(
    token: str,
    password: Optional[str] = None,
    db: Session = Depends(get_db),
):
    link, err = service.access_share(db, token, password)
    if err:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=err)
    return AccessShareResponse(file_id=link.file_id, access_count=link.access_count)
