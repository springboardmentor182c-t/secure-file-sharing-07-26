from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.users import service
from src.auth.dependencies import get_current_user
from src.entities.user import User

router = APIRouter()


@router.get("/")
def list_users(db: Session = Depends(get_db)):
    users = service.list_users(db)
    return users
