import os
import uuid
import hashlib
import mimetypes
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from src.entities.file import File
from src.entities.folder import Folder
from src.entities.user import User
from src.entities.audit_log import AuditLog

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def _audit(db: Session, user_id: int, action: str, resource_name: str, resource_id: int = None, level: str = "info"):
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type="file",
        resource_id=resource_id,
        resource_name=resource_name,
        level=level,
    )
    db.add(log)


def get_user_files(db: Session, owner_id: int, folder_id: int | None = None) -> list[File]:
    q = db.query(File).filter(File.owner_id == owner_id, File.is_deleted == False)
    if folder_id is not None:
        q = q.filter(File.folder_id == folder_id)
    else:
        q = q.filter(File.folder_id == None)
    return q.order_by(File.created_at.desc()).all()


def get_file(db: Session, file_id: int, owner_id: int) -> File:
    f = db.query(File).filter(File.id == file_id, File.owner_id == owner_id, File.is_deleted == False).first()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return f


def upload_file(db: Session, upload: UploadFile, owner_id: int, folder_id: int | None, encrypted: bool) -> File:
    if folder_id is not None:
        folder = db.query(Folder).filter(Folder.id == folder_id, Folder.owner_id == owner_id).first()
        if not folder:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid folder")

    stored_name = f"{uuid.uuid4().hex}{Path(upload.filename).suffix}"
    dest = UPLOAD_DIR / stored_name

    # Save to disk & compute hash
    sha256 = hashlib.sha256()
    size = 0
    with open(dest, "wb") as out:
        while chunk := upload.file.read(1024 * 64):
            out.write(chunk)
            sha256.update(chunk)
            size += len(chunk)

    mimetype = upload.content_type or mimetypes.guess_type(upload.filename)[0] or "application/octet-stream"

    file = File(
        original_name=upload.filename,
        stored_name=stored_name,
        mimetype=mimetype,
        size=size,
        encrypted=encrypted,
        hash_sha256=sha256.hexdigest(),
        owner_id=owner_id,
        folder_id=folder_id,
    )
    db.add(file)

    # Update user storage
    user = db.query(User).filter(User.id == owner_id).first()
    if user:
        user.storage_used += size

    _audit(db, owner_id, "UPLOAD", upload.filename, level="info")
    db.commit()
    db.refresh(file)
    return file


def delete_file(db: Session, file_id: int, owner_id: int) -> None:
    f = get_file(db, file_id, owner_id)
    f.is_deleted = True

    # Free up storage
    user = db.query(User).filter(User.id == owner_id).first()
    if user and user.storage_used >= f.size:
        user.storage_used -= f.size

    _audit(db, owner_id, "DELETE", f.original_name, resource_id=file_id, level="warn")
    db.commit()


def get_file_path(db: Session, file_id: int, owner_id: int) -> tuple[Path, str]:
    f = db.query(File).filter(File.id == file_id, File.owner_id == owner_id, File.is_deleted == False).first()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    path = UPLOAD_DIR / f.stored_name
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File data not found on disk")
    return path, f.original_name
