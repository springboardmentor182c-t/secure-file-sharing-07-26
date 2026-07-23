import os
from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.database.core import get_db
from src.entities.user import User
from src.files.service import get_file_path
from src.shared_with_me.models import SharedFilesResponse
from src.shared_with_me.service import get_downloadable_shared_file, list_shared_files


router = APIRouter()


@router.get("/", response_model=SharedFilesResponse)
def shared_with_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_shared_files(db, current_user.id)


@router.get("/{file_id}/download")
def download_shared_file(file_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file = get_downloadable_shared_file(db, file_id, current_user.id)
    path, original_name = get_file_path(db, file.id, current_user.id)
    try:
        with open(path, "rb") as source:
            data = source.read()
        return StreamingResponse(BytesIO(data), media_type=file.mimetype, headers={"Content-Disposition": f'attachment; filename="{original_name}"'})
    finally:
        if os.path.exists(path):
            os.remove(path)
