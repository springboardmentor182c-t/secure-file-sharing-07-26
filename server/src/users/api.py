from fastapi import APIRouter

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
def get_users_placeholder():
    return {"message": "Users endpoints placeholder"}
