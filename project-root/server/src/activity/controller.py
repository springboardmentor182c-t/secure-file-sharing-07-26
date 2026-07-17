from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.activity.models import ActivityCreate, ActivityResponse
from src.activity.service import create_activity, get_all_activities, get_user_activities
from src.database.core import get_db


router = APIRouter()


@router.post("/", response_model=ActivityResponse, status_code=201)
def add_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    return create_activity(db, activity)


@router.get("/", response_model=list[ActivityResponse])
def list_activities(db: Session = Depends(get_db)):
    return get_all_activities(db)


@router.get("/user/{user_id}", response_model=list[ActivityResponse])
def list_user_activities(user_id: int, db: Session = Depends(get_db)):
    return get_user_activities(db, user_id)