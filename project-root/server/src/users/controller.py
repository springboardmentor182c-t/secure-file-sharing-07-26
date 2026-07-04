from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.users import models, service

router = APIRouter()

@router.get('/', response_model=list[models.UserOut])
def list_users(db: Session = Depends(get_db)):
    return service.get_all_users(db)

@router.get('/{user_id}', response_model=models.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return service.get_user_by_id(db, user_id)
