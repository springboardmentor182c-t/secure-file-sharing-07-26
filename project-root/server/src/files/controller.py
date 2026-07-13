from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.files import models, service

router = APIRouter()


@router.get("/", response_model=models.FileListResponse)
def list_files(
    folder_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    files = service.get_user_files(db, current_user.id, folder_id)
    return {"files": files, "total": len(files)}


@router.post("/upload", response_model=models.FileOut, status_code=201)
def upload_file(
    file: UploadFile = FastAPIFile(...),
    folder_id: Optional[int] = Query(None),
    encrypted: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check storage quota
    if current_user.storage_used >= current_user.storage_quota:
        raise HTTPException(status_code=400, detail="Storage quota exceeded")
    return service.upload_file(db, file, current_user.id, folder_id, encrypted)


@router.get("/{file_id}", response_model=models.FileOut)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_file(db, file_id, current_user.id)


@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    path, original_name = service.get_file_path(db, file_id, current_user.id)
    return FileResponse(
        path=str(path),
        filename=original_name,
        media_type="application/octet-stream",
    )


@router.delete("/{file_id}", status_code=204)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service.delete_file(db, file_id, current_user.id)
