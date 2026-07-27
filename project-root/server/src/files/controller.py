import io
import uuid
from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, Query, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.files import models, service

router = APIRouter()


@router.get("/", response_model=models.FileListResponse, summary="List all files for the current user")
def list_files(
    folder_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    files = service.get_user_files(db, current_user.id, folder_id)
    return {"files": files, "total": len(files)}


@router.post("/upload", response_model=models.FileOut, status_code=status.HTTP_201_CREATED, summary="Upload a new file")
def upload_file(
    file: UploadFile = FastAPIFile(...),
    folder_id: Optional[uuid.UUID] = Query(None),
    encrypted: bool = Query(False, description="Encrypt the file on upload"),
    mimetype: Optional[str] = Query(None, description="Override file mimetype (e.g. for E2EE)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.storage_used >= current_user.storage_quota:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Storage quota exceeded ({current_user.storage_quota} bytes limit)",
        )
    return service.upload_file(db, file, current_user.id, folder_id, encrypted, mimetype)


@router.get("/{file_id}", response_model=models.FileOut, summary="Get file metadata")
def get_file(
    file_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_file(db, file_id, current_user.id)


@router.get("/{file_id}/download", summary="Download a file (raw stream, decrypted on client)")
def download_file(
    file_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    path, original_name, is_encrypted = service.get_file_path(db, file_id, current_user.id)
    return FileResponse(
        path=str(path),
        filename=original_name,
        media_type="application/octet-stream",
    )


@router.patch("/{file_id}/encrypt", response_model=models.FileOut, summary="Toggle file encryption status")
def toggle_encryption(
    file_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle DB encrypted flag status (encryption is offloaded to E2EE client)."""
    return service.toggle_encryption(db, file_id, current_user.id)


@router.patch("/{file_id}/rename", response_model=models.FileOut, summary="Rename a file")
def rename_file(
    file_id: uuid.UUID,
    body: models.FileRenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.rename_file(db, file_id, current_user.id, body.new_name)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a file")
def delete_file(
    file_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service.delete_file(db, file_id, current_user.id)
