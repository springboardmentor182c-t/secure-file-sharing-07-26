from datetime import datetime, timezone
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
from src.shared_with_me.models import (
    DirectShareCreate,
    DirectShareOut,
    DirectSharesResponse,
    SharedFilesResponse,
)
from src.shared_with_me.service import (
    get_downloadable_shared_file,
    grant_direct_share,
    list_direct_shares,
    list_shared_files,
    revoke_direct_share,
)

router = APIRouter()


def _should_increment_access(permission: FilePermission) -> bool:
    """Debounce rapid double-requests (e.g. React StrictMode or browser range requests) within 3 seconds."""
    now = datetime.now(timezone.utc)
    if not permission.last_accessed_at:
        return True
    last = permission.last_accessed_at
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    return (now - last).total_seconds() > 3.0


@router.get("/direct", response_model=DirectSharesResponse)
def direct_shares(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
def shared_with_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_shared_files(db, current_user.id)


@router.get("/{file_id}/download")
def download_shared_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file, permission = get_downloadable_shared_file(db, file_id, current_user.id)

    # Debounced view increment
    if _should_increment_access(permission):
        permission.access_count = (permission.access_count or 0) + 1
        permission.last_accessed_at = datetime.now(timezone.utc)
        db.commit()

    decrypted_bytes, original_name, mimetype = get_file_path(
        db,
        file.id,
        file.owner_id,
        notification_user_id=current_user.id,
    )

    return StreamingResponse(
        BytesIO(decrypted_bytes),
        media_type=mimetype or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{original_name}"',
            "Content-Length": str(len(decrypted_bytes)),
        },
    )


@router.get("/{file_id}/view")
def view_shared_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
            detail="You do not have permission to view this file.",
        )

    permission, file = row

    if _should_increment_access(permission):
        permission.access_count = (permission.access_count or 0) + 1
        permission.last_accessed_at = datetime.now(timezone.utc)
        db.commit()

    decrypted_bytes, original_name, mimetype = get_file_path(
        db,
        file.id,
        file.owner_id,
        notification_user_id=current_user.id,
    )

    return StreamingResponse(
        BytesIO(decrypted_bytes),
        media_type=mimetype or file.mimetype or "application/octet-stream",
        headers={
            "Content-Disposition": f'inline; filename="{original_name}"',
            "Content-Length": str(len(decrypted_bytes)),
        },
    )