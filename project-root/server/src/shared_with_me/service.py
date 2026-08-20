from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased

from src.entities.file import File
from src.entities.file_permission import FilePermission
from src.entities.user import User
from src.notifications.service import create_notification
from src.shared_with_me.models import (
    DirectShareCreate,
    DirectShareOut,
    DirectSharesResponse,
    SharedFileOut,
    SharedFilesResponse,
)

DOWNLOAD_PERMISSIONS = {"download", "edit", "admin"}


def _owned_file(db: Session, file_id: int, owner_id: int) -> File:
    file = (
        db.query(File)
        .filter(File.id == file_id, File.owner_id == owner_id, File.is_deleted == False)
        .first()
    )
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")
    return file


def list_direct_shares(db: Session, owner_id: int) -> DirectSharesResponse:
    recipient = aliased(User)
    rows = (
        db.query(FilePermission, File, recipient)
        .join(File, FilePermission.file_id == File.id)
        .join(recipient, FilePermission.user_id == recipient.id)
        .filter(File.owner_id == owner_id, File.is_deleted == False)
        .order_by(FilePermission.created_at.desc())
        .all()
    )
    shares = [
        DirectShareOut(
            permission_id=permission.id,
            file_id=file.id,
            file_name=file.original_name,
            recipient_id=user.id,
            recipient_name=user.name,
            recipient_email=user.email,
            permission=permission.permission_level,
            access_count=permission.access_count or 0,
            last_accessed_at=permission.last_accessed_at,
            shared_at=permission.created_at,
        )
        for permission, file, user in rows
    ]
    return DirectSharesResponse(shares=shares, total=len(shares))


def grant_direct_share(db: Session, data: DirectShareCreate, owner_id: int) -> DirectShareOut:
    file = _owned_file(db, data.file_id, owner_id)
    email = data.recipient_email.strip().lower()
    recipient = db.query(User).filter(func.lower(User.email) == email).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No TrustShare account exists for that email address.",
        )
    if recipient.id == owner_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot share a file with yourself.")

    existing_permission = (
        db.query(FilePermission)
        .filter(FilePermission.file_id == file.id, FilePermission.user_id == recipient.id)
        .first()
    )
    if existing_permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'"{file.original_name}" is already shared with this teammate. Revoke their current access first if you want to modify permissions.',
        )

    permission = FilePermission(
        file_id=file.id,
        user_id=recipient.id,
        granted_by=owner_id,
        permission_level=data.permission,
        access_count=0,
    )
    db.add(permission)

    owner = db.query(User).filter(User.id == owner_id).first()
    create_notification(
        db,
        user_id=recipient.id,
        type="share",
        category="shares",
        title="A file was shared with you",
        message=f'{owner.name if owner else "A teammate"} shared "{file.original_name}" with you.',
        icon="share",
    )
    db.commit()
    db.refresh(permission)
    return DirectShareOut(
        permission_id=permission.id,
        file_id=file.id,
        file_name=file.original_name,
        recipient_id=recipient.id,
        recipient_name=recipient.name,
        recipient_email=recipient.email,
        permission=permission.permission_level,
        access_count=permission.access_count or 0,
        last_accessed_at=permission.last_accessed_at,
        shared_at=permission.created_at,
    )


def revoke_direct_share(db: Session, permission_id: int, owner_id: int) -> None:
    permission = (
        db.query(FilePermission)
        .join(File, FilePermission.file_id == File.id)
        .filter(FilePermission.id == permission_id, File.owner_id == owner_id)
        .first()
    )
    if not permission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Direct share not found.")
    db.delete(permission)
    db.commit()


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
            access_count=permission.access_count or 0,
            last_accessed_at=permission.last_accessed_at,
        )
        for permission, file, owner in rows
    ]
    downloadable = sum(item.can_download for item in files)
    return SharedFilesResponse(files=files, total=len(files), view_only=len(files) - downloadable, downloadable=downloadable)


def get_downloadable_shared_file(db: Session, file_id: int, user_id: int) -> tuple[File, FilePermission]:
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
    return row[1], row[0]