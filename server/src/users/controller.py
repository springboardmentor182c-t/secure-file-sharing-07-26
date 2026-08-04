from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from src.database.core import get_db
from src.users import models, service

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)

# Placeholder UUID for testing (Replace with JWT Dependency later)
DUMMY_UUID = UUID("12345678-1234-5678-1234-567812345678")

@router.get("/me", response_model=models.UserProfileResponse)
def get_my_profile(db: Session = Depends(get_db)):
    return service.get_user_profile_data(db, DUMMY_UUID)

@router.put("/me/personal-info")
def update_my_personal_info(data: models.UpdatePersonalInfoRequest, db: Session = Depends(get_db)):
    return service.update_personal_info(db, DUMMY_UUID, data)

@router.put("/me/password")
def update_my_password(data: models.UpdatePasswordRequest, db: Session = Depends(get_db)):
    return service.update_password(db, DUMMY_UUID, data)

@router.put("/me/preferences")
def update_my_preferences(data: models.UpdatePreferencesRequest, db: Session = Depends(get_db)):
    return service.update_user_preferences(db, DUMMY_UUID, data)