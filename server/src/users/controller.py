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