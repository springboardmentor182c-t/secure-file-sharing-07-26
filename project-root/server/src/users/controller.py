from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.users import models, service
from src.auth.dependencies import get_current_user
from src.entities.user import User

router = APIRouter()

@router.get('/', response_model=list[models.UserOut])
def list_users(db: Session = Depends(get_db)):
    return service.get_all_users(db)

@router.patch('/me', response_model=models.UserOut)
def update_current_user(
    data: models.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.update_user(db, current_user, data)

@router.get('/{user_id}', response_model=models.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return service.get_user_by_id(db, user_id)
