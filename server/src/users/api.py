from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.core import get_db
from src.entities.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/users", tags=["users"])

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()