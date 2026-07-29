import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.folders import models, service

router = APIRouter()


@router.get("/", response_model=models.FolderListResponse, summary="List folders for the current user")
def list_folders(
    parent_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns root-level folders when parent_id is omitted, or sub-folders of a given parent."""
    folders = service.get_user_folders(db, current_user.id, parent_id)
    return {"folders": folders, "total": len(folders)}


@router.post("/", response_model=models.FolderOut, status_code=status.HTTP_201_CREATED, summary="Create a new folder")
def create_folder(
    body: models.FolderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a folder at root or inside a parent folder."""
    return service.create_folder(db, current_user.id, body.name, body.parent_id)


@router.patch("/{folder_id}/rename", response_model=models.FolderOut, summary="Rename a folder")
def rename_folder(
    folder_id: uuid.UUID,
    body: models.FolderRenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.rename_folder(db, folder_id, current_user.id, body.new_name)


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a folder and its contents")
def delete_folder(
    folder_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes the folder, soft-deletes all files inside it, and recursively removes sub-folders."""
    service.delete_folder(db, folder_id, current_user.id)
