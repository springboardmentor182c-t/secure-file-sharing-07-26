from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.shares.service import ShareCreate, ShareOut, create_share, list_shares, revoke_share, access_share

router = APIRouter()


@router.get("/", response_model=list[ShareOut])
def my_shares(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_shares(db, current_user.id)


@router.post("/", response_model=ShareOut, status_code=201)
def create(data: ShareCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_share(db, data, current_user.id)


@router.delete("/{share_id}", status_code=204)
def revoke(share_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    revoke_share(db, share_id, current_user.id)


@router.get("/access/{token}", response_model=ShareOut)
def public_access(token: str, password: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Public endpoint — no auth required. Validates token & optional password."""
    return access_share(db, token, password)
