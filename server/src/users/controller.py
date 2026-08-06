
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from src.database.core import get_db

from src.auth.dependencies import get_current_user

from src.entities.user import User
from src.entities.role import Role


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_my_profile(
    payload=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = payload["sub"]


    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    if user is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


    role = (
        db.query(Role)
        .filter(
            Role.id == user.role_id
        )
        .first()
    )


    return {

        "id": str(user.id),

        "username": user.username,

        "email": user.email,

        "role": role.role_name if role else "user"

    }

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

