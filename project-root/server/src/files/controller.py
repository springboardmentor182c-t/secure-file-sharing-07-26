from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.database.session import get_db
from src.files import service

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/{file_id}/download")
def download_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Download a user's file by id.

    Resolves file path via the service layer and returns a FileResponse.
    """
    path, original_name = service.get_file_path(db, file_id, current_user.id)

    return FileResponse(
        path=str(path),
        filename=original_name,
        media_type="application/octet-stream",
    )
