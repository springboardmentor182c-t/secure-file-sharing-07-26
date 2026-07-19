from fastapi import HTTPException, status
from sqlalchemy.orm import Session, aliased

from src.entities.file import File
from src.entities.file_permission import FilePermission
from src.entities.user import User
from src.shared_with_me.models import SharedFileOut, SharedFilesResponse


DOWNLOAD_PERMISSIONS = {"download", "edit", "admin"}


def list_shared_files(db: Session, user_id: int) -> SharedFilesResponse:
    grantor = aliased(User)
    rows = (
        db.query(FilePermission, File, grantor)
        .join(File, FilePermission.file_id == File.id)
        .outerjoin(grantor, FilePermission.granted_by == grantor.id)
        .filter(
            FilePermission.user_id == user_id,
            File.is_deleted == False,
            File.owner_id != user_id,
        )
        .order_by(FilePermission.created_at.desc())
        .all()
    )

    files = [
        SharedFileOut(
            permission_id=permission.id,
            file_id=file.id,
            name=file.original_name,
            mimetype=file.mimetype,
            size=file.size,
            encrypted=file.encrypted,
            permission=permission.permission_level,
            shared_by=owner.name if owner else "Unknown user",
            shared_by_email=owner.email if owner else "",
            shared_at=permission.created_at,
            updated_at=file.updated_at,
            can_download=permission.permission_level in DOWNLOAD_PERMISSIONS,
        )
        for permission, file, owner in rows
    ]
    downloadable = sum(item.can_download for item in files)
    return SharedFilesResponse(files=files, total=len(files), view_only=len(files) - downloadable, downloadable=downloadable)


def get_downloadable_shared_file(db: Session, file_id: int, user_id: int) -> File:
    row = (
        db.query(FilePermission, File)
        .join(File, FilePermission.file_id == File.id)
        .filter(
            FilePermission.file_id == file_id,
            FilePermission.user_id == user_id,
            FilePermission.permission_level.in_(DOWNLOAD_PERMISSIONS),
            File.is_deleted == False,
            File.owner_id != user_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to download this file.")
    return row[1]
