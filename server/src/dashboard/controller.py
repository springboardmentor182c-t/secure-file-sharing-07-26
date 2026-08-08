from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.core import get_db
from . import models, service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=models.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return service.get_dashboard_stats(db)


@router.get("/storage-by-user", response_model=list[models.StorageByUser])
def get_storage_by_user(db: Session = Depends(get_db)):
    return service.get_storage_by_user(db)


@router.get("/users", response_model=list[models.UserOut])
def get_users(db: Session = Depends(get_db)):
    return service.get_users_with_file_counts(db)


@router.get("/monitoring", response_model=list[models.SystemServiceOut])
def get_monitoring(db: Session = Depends(get_db)):
    return service.get_monitoring(db)

@router.post("/users/invite", response_model=models.UserOut)
def invite_user(payload: models.InviteUserRequest, db: Session = Depends(get_db)):
    try:
        return service.invite_user(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/users/{user_id}")
def update_user(user_id: int, payload: dict, db: Session = Depends(get_db)):
    return service.update_user_management(db, user_id, payload)


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return service.delete_user_management(db, user_id)


users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.get("/me")
def get_my_profile(db: Session = Depends(get_db)):
    return service.get_profile(db)

@users_router.put("/me")
def update_my_profile(payload: dict, db: Session = Depends(get_db)):
    return service.update_profile(db, payload)


settings_router = APIRouter(prefix="/settings", tags=["Settings"])

@settings_router.get("")
def get_system_settings(db: Session = Depends(get_db)):
    return service.get_settings(db)

@settings_router.post("")
def update_system_settings(payload: dict, db: Session = Depends(get_db)):
    return service.update_settings(db, payload)