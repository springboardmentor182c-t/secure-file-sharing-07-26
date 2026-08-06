import os
import uuid
import hashlib
import mimetypes
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from src.entities.file import File
from src.entities.user import User
from src.entities.audit_log import AuditLog
from src.folders.service import get_folder_path_on_disk

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ── Internal helpers ──────────────────────────────────────────────────────────

def _audit(
    db: Session,
    user_id: uuid.UUID,
    action: str,
    resource_name: str,
    resource_id: uuid.UUID | str = None,
    level: str = "info",
) -> None:
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type="file",
        resource_id=str(resource_id) if resource_id else None,
        resource_name=resource_name,
        level=level,
    )
    db.add(log)


def _get_file_or_404(db: Session, file_id: uuid.UUID) -> File:
    f = db.query(File).filter(File.id == file_id, File.is_deleted == False).first()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return f


def _assert_owner(f: File, owner_id: uuid.UUID) -> None:
    if f.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")


# ── Public service functions ──────────────────────────────────────────────────

def get_user_files(
    db: Session,
    owner_id: uuid.UUID,
    folder_id: uuid.UUID | None = None,
) -> list[File]:
    """
    Return all non-deleted files owned by the user.
    If folder_id is None (Home), we return all user files across all folders.
    If folder_id is provided, we filter to show only files inside that folder.
    """
    q = (
        db.query(File)
        .filter(File.owner_id == owner_id, File.is_deleted == False)
    )
    if folder_id is not None:
        q = q.filter(File.folder_id == folder_id)
    
    return q.order_by(File.created_at.desc()).all()


def get_file(db: Session, file_id: uuid.UUID, owner_id: uuid.UUID) -> File:
    f = _get_file_or_404(db, file_id)
    _assert_owner(f, owner_id)
    return f


def upload_file(
    db: Session,
    upload: UploadFile,
    owner_id: uuid.UUID,
    folder_id: uuid.UUID | None,
    encrypted: bool,
    mimetype_override: str | None = None,
) -> File:
    """Stream-upload a file. All encryption is handled by the E2EE client in the browser."""
    stored_name = f"{uuid.uuid4().hex}{Path(upload.filename).suffix}"
    
    # Resolve physical parent folder path on disk
    folder_path = get_folder_path_on_disk(db, folder_id)
    folder_path.mkdir(parents=True, exist_ok=True)
    dest = folder_path / stored_name

    # Write bytes directly to disk and compute hash
    sha256 = hashlib.sha256()
    size = 0
    with open(dest, "wb") as out:
        while chunk := upload.file.read(1024 * 64):
            out.write(chunk)
            sha256.update(chunk)
            size += len(chunk)

    mimetype = mimetype_override or upload.content_type or mimetypes.guess_type(upload.filename)[0] or "application/octet-stream"

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

    user = db.query(User).filter(User.id == owner_id).first()
    if user:
        user.storage_used += size

    _audit(db, owner_id, "UPLOAD", upload.filename, level="info")
    db.commit()
    db.refresh(file)
    return file


def rename_file(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    new_name: str,
) -> File:
    f = get_file(db, file_id, owner_id)
    old_name = f.original_name
    f.original_name = new_name
    _audit(db, owner_id, "RENAME", f"{old_name} → {new_name}", resource_id=file_id, level="info")
    db.commit()
    db.refresh(f)
    return f


def toggle_encryption(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
) -> File:
    """Toggle DB encrypted flag status. Actual encryption is offloaded to E2EE client."""
    f = get_file(db, file_id, owner_id)
    
    # Toggle flag status in DB
    f.encrypted = not f.encrypted
    
    action = "ENCRYPT" if f.encrypted else "DECRYPT"
    _audit(db, owner_id, action, f.original_name, resource_id=file_id, level="info")
    
    db.commit()
    db.refresh(f)
    return f


def delete_file(db: Session, file_id: uuid.UUID, owner_id: uuid.UUID) -> None:
    """Hard-delete a file: removes DB record and deletes physical file from its folder directory."""
    f = get_file(db, file_id, owner_id)

    file_name = f.original_name
    stored_name = f.stored_name
    file_size = f.size
    folder_id = f.folder_id

    _audit(db, owner_id, "DELETE", file_name, resource_id=file_id, level="warn")

    user = db.query(User).filter(User.id == owner_id).first()
    if user and user.storage_used >= file_size:
        user.storage_used -= file_size

    db.delete(f)
    db.commit()

    # Resolve physical parent folder path on disk
    folder_path = get_folder_path_on_disk(db, folder_id)
    disk_path = folder_path / stored_name
    if disk_path.exists():
        try:
            os.remove(disk_path)
        except OSError:
            pass


def get_file_path(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
) -> tuple[Path, str, bool]:
    """Return (disk_path, original_name, is_encrypted) for downloading a file."""
    f = get_file(db, file_id, owner_id)
    
    # Resolve physical parent folder path on disk
    folder_path = get_folder_path_on_disk(db, f.folder_id)
    path = folder_path / f.stored_name

    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File data not found on disk")
    _audit(db, owner_id, "DOWNLOAD", f.original_name, resource_id=file_id, level="info")
    db.commit()
    return path, f.original_name, f.encrypted
