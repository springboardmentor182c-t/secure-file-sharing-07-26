from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.trash.service import TrashService
from src.trash.schemas import (
    TrashFileResponse,
    RestoreResponse,
    DeleteResponse,
)


router = APIRouter(
    prefix="/trash",
    tags=["Trash"]
)


# Get all deleted files
@router.get(
    "/files",
    response_model=list[TrashFileResponse]
)
def get_trash_files(
    db: Session = Depends(get_db)
):
    service = TrashService(db)

    return service.get_deleted_files()


# Restore file
@router.put(
    "/files/{file_id}/restore",
    response_model=RestoreResponse
)
def restore_file(
    file_id: UUID,
    db: Session = Depends(get_db)
):
    service = TrashService(db)

    file = service.restore_file(file_id)

    if file is None:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return {
        "message": "File restored successfully"
    }


# Delete permanently
@router.delete(
    "/files/{file_id}",
    response_model=DeleteResponse
)
def delete_file(
    file_id: UUID,
    db: Session = Depends(get_db)
):
    service = TrashService(db)

    result = service.delete_file(file_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return {
        "message": "File permanently deleted"
    }


# Empty trash
@router.delete(
    "",
    response_model=DeleteResponse
)
def empty_trash(
    db: Session = Depends(get_db)
):
    service = TrashService(db)

    count = service.empty_trash()

    return {
        "message": f"{count} files permanently deleted"
    }