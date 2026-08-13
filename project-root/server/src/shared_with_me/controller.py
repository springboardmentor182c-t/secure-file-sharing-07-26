import os
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.database.core import get_db
from src.entities.user import User
from src.entities.file import File
from src.entities.file_permission import FilePermission
from src.files.service import get_file_path
from src.shared_with_me.models import DirectShareCreate, DirectShareOut, DirectSharesResponse, SharedFilesResponse
from src.shared_with_me.service import (
    get_downloadable_shared_file,
    grant_direct_share,
    list_direct_shares,
    list_shared_files,
    revoke_direct_share,
)


router = APIRouter()


@router.get("/direct", response_model=DirectSharesResponse)
def direct_shares(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_direct_shares(db, current_user.id)


@router.post("/direct", response_model=DirectShareOut, status_code=status.HTTP_201_CREATED)
def create_direct_share(
    data: DirectShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return grant_direct_share(db, data, current_user.id)


@router.delete("/direct/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_direct_share(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revoke_direct_share(db, permission_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/", response_model=SharedFilesResponse)
def shared_with_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_shared_files(db, current_user.id)


@router.get("/{file_id}/download")
def download_shared_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file = get_downloadable_shared_file(db, file_id, current_user.id)
    path, original_name = get_file_path(
        db,
        file.id,
        file.owner_id,
        notification_user_id=current_user.id,
    )
    try:
        with open(path, "rb") as source:
            data = source.read()
        return StreamingResponse(
            BytesIO(data),
            media_type=file.mimetype,
            headers={"Content-Disposition": f'attachment; filename="{original_name}"'}
        )
    finally:
        if os.path.exists(path):
            os.remove(path)


@router.get("/{file_id}/view")
def view_shared_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    row = (
        db.query(FilePermission, File)
        .join(File, FilePermission.file_id == File.id)
        .filter(
            FilePermission.file_id == file_id,
            FilePermission.user_id == current_user.id,
            File.is_deleted == False,
            File.owner_id != current_user.id,
        )
        .first()
    )
    if not row:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this file."
        )

    permission, file = row

    try:
        path, original_name = get_file_path(
            db,
            file.id,
            file.owner_id,
            notification_user_id=current_user.id,
        )
        with open(path, "rb") as source:
            data = source.read()
        return StreamingResponse(
            BytesIO(data),
            media_type=file.mimetype,
            headers={
                "Content-Disposition": f'inline; filename="{original_name}"'
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load file: {str(e)}"
        )
    finally:
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass
