import os
import re
import uuid
import hashlib
import mimetypes
from pathlib import Path
from tempfile import NamedTemporaryFile

from sqlalchemy.orm import Session
from datetime import datetime, timezone
from fastapi import HTTPException, UploadFile, status

from src.entities.file import File
from src.entities.folder import Folder
from src.entities.user import User
from src.entities.audit_log import AuditLog
from src.security.exceptions import KeyManagementError

# Security Module

from src.security.validation.validators import (
    validate_upload,
)

from src.security.key_manager import (
    generate_key,
    save_key,
    load_key,
    delete_key,
)

from src.security.encryption import (
    encrypt_bytes,
    decrypt_bytes,
)

from src.security.secure_storage import (
    save_encrypted_file,
    load_encrypted_file,
    delete_encrypted_file,
)

from src.security.hashing import (
    calculate_sha256,
)

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def sanitize_filename(filename: str) -> str:
    """
    Remove unsafe characters from uploaded filenames.
    """

    filename = Path(filename).name

    filename = re.sub(
        r'[<>:"/\\|?*\x00-\x1F]',
        "_",
        filename,
    )

    filename = filename.strip()

    if not filename:
        filename = "uploaded_file"

    return filename


def _audit(
    db: Session,
    user_id: int,
    action: str,
    resource_name: str,
    resource_id: int = None,
    level: str = "info",
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type="file",
        resource_id=resource_id,
        resource_name=resource_name,
        level=level,
    )
    db.add(log)


def _detect_suspicious_activity(
    db: Session,
    user_id: int,
):
    """
    Detect repeated unauthorized access attempts.
    """

    failed_attempts = (
        db.query(AuditLog)
        .filter(
            AuditLog.user_id == user_id,
            AuditLog.action.in_(
                [
                    "UNAUTHORIZED_ACCESS",
                    "UNAUTHORIZED_DOWNLOAD",
                ]
            ),
        )
        .count()
    )

    if failed_attempts >= 5:

        _audit(
            db,
            user_id,
            "SUSPICIOUS_ACTIVITY",
            "Repeated unauthorized access attempts",
            level="critical",
        )


def get_user_files(
    db: Session, owner_id: int, folder_id: int | None = None
) -> list[File]:
    q = db.query(File).filter(File.owner_id == owner_id, File.is_deleted == False)
    if folder_id is not None:
        q = q.filter(File.folder_id == folder_id)
    else:
        q = q.filter(File.folder_id == None)
    return q.order_by(File.created_at.desc()).all()


def get_file(db: Session, file_id: int, owner_id: int) -> File:
    """
    Fetch file metadata and authorize owner access. Does not load file bytes.
    """
    f = (
        db.query(File)
        .filter(File.id == file_id, File.is_deleted == False)
        .first()
    )

    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Owner Authorization
    if f.owner_id != owner_id:
        _audit(
            db,
            owner_id,
            "UNAUTHORIZED_ACCESS",
            f.original_name,
            resource_id=f.id,
            level="warning",
        )
        _detect_suspicious_activity(db, owner_id)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this file.",
        )

    return f


def upload_file(db: Session, upload: UploadFile, owner_id: int, folder_id: int | None, encrypted: bool) -> File:
    """
    Accept an UploadFile and persist it to secure storage and DB metadata.
    """
    # Validate upload
    upload.file.seek(0)
    file_bytes = upload.file.read()
    file_size = len(file_bytes)
    upload.file.seek(0)

    validate_upload(db, upload, file_size)

    # Sanitize filename
    safe_filename = sanitize_filename(upload.filename)

    # Verify folder ownership if provided
    if folder_id is not None:
        folder = db.query(Folder).filter(Folder.id == folder_id, Folder.owner_id == owner_id).first()
        if not folder:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid folder")

    # Generate unique storage filename
    stored_name = f"{uuid.uuid4().hex}{Path(safe_filename).suffix.lower()}"

    # Encrypt / prepare bytes to store
    if encrypted:
        aes_key = generate_key()
        stored_bytes = encrypt_bytes(file_bytes, aes_key)
    else:
        stored_bytes = file_bytes

    # Persist to secure storage (this abstracts where bytes are kept)
    save_encrypted_file(stored_name, stored_bytes)

    # If encrypted, persist key
    if encrypted:
        save_key(stored_name, aes_key)

    # SHA-256 Integrity Hash (Original File)
    hash_sha256 = hashlib.sha256(file_bytes).hexdigest()

    # Detect MIME Type
    mimetype = (
        upload.content_type
        or mimetypes.guess_type(safe_filename)[0]
        or "application/octet-stream"
    )

    # Save metadata
    file = File(
        original_name=safe_filename,
        stored_name=stored_name,
        mimetype=mimetype,
        size=file_size,
        encrypted=encrypted,
        hash_sha256=hash_sha256,
        owner_id=owner_id,
        folder_id=folder_id,
    )

    db.add(file)

    # Generate primary key before audit logging
    db.flush()

    # Update user storage
    user = db.query(User).filter(User.id == owner_id).first()

    if user:
        user.storage_used = (user.storage_used or 0) + file_size

    # Audit log
    _audit(
        db,
        owner_id,
        "UPLOAD",
        safe_filename,
        resource_id=file.id,
        level="info",
    )

    # Commit transaction
    db.commit()
    db.refresh(file)

    return file


def delete_file(db: Session, file_id: int, owner_id: int) -> None:
    """
    Soft-delete file metadata and remove stored bytes + key when possible.
    """
    f = get_file(db, file_id, owner_id)

    # Ensure ownership is already checked inside get_file

    # Attempt to delete stored bytes
    try:
        delete_encrypted_file(f.stored_name)
    except Exception:
        # best-effort
        pass

    # Delete AES Key if present
    if f.encrypted:
        try:
            delete_key(f.stored_name)
        except Exception:
            pass

    # Soft Delete Metadata
    f.is_deleted = True

    # Update Storage Usage
    user = db.query(User).filter(User.id == owner_id).first()
    if user:
        user.storage_used = max(0, (user.storage_used or 0) - (f.size or 0))

    # Audit Log
    _audit(
        db,
        owner_id,
        "DELETE",
        f.original_name,
        resource_id=f.id,
        level="warn",
    )

    db.commit()


def get_file_path(db: Session, file_id: int, owner_id: int) -> tuple[Path, str]:
    """
    Return a tuple (path_on_disk, original_filename).

    For encrypted files we decrypt into a temporary file and return its path.
    For unencrypted files, prefer returning the on-disk stored path if present; otherwise attempt to load from secure storage.
    """
    f = db.query(File).filter(File.id == file_id, File.is_deleted == False).first()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Authorize
    if f.owner_id != owner_id:
        _audit(db, owner_id, "UNAUTHORIZED_DOWNLOAD", f.original_name, resource_id=f.id, level="warning")
        _detect_suspicious_activity(db, owner_id)
        db.commit()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to access this file.")

    # If file is not encrypted and stored as a file on disk, return that path directly
    disk_path = UPLOAD_DIR / f.stored_name
    if not f.encrypted and disk_path.exists():
        # Track download
        f.download_count = (f.download_count or 0) + 1
        f.last_downloaded_at = datetime.now(timezone.utc)
        _audit(db, owner_id, "DOWNLOAD", f.original_name, resource_id=f.id, level="info")
        db.commit()
        return disk_path, f.original_name

    # Otherwise, load from secure storage
    try:
        encrypted_bytes = load_encrypted_file(f.stored_name)
    except Exception:
        _audit(db, owner_id, "ENCRYPTED_FILE_MISSING", f.original_name, resource_id=f.id, level="critical")
        db.commit()
        raise HTTPException(status_code=500, detail="Stored file not found.")

    # Decrypt if needed
    if f.encrypted:
        try:
            aes_key = load_key(f.stored_name)
        except Exception:
            _audit(db, owner_id, "KEY_NOT_FOUND", f.original_name, resource_id=f.id, level="critical")
            db.commit()
            raise HTTPException(status_code=500, detail="Encryption key not found.")

        try:
            decrypted_bytes = decrypt_bytes(encrypted_bytes, aes_key)
        except Exception:
            _audit(db, owner_id, "DECRYPTION_FAILED", f.original_name, resource_id=f.id, level="critical")
            db.commit()
            raise HTTPException(status_code=500, detail="Unable to decrypt file.")
    else:
        decrypted_bytes = encrypted_bytes

    # Integrity Verification and write to temp file
    temp_file = NamedTemporaryFile(delete=False, suffix=Path(f.original_name).suffix)
    try:
        temp_file.write(decrypted_bytes)
        temp_file.flush()
        temp_file.close()

        # Verify Original Integrity
        sha256 = hashlib.sha256()
        sha256.update(decrypted_bytes)
        calculated_hash = sha256.hexdigest()

        if calculated_hash != f.hash_sha256:
            _audit(db, owner_id, "INTEGRITY_FAILURE", f.original_name, resource_id=f.id, level="critical")
            db.commit()
            os.remove(temp_file.name)
            raise HTTPException(status_code=500, detail="File integrity verification failed.")

        # Download Tracking
        f.download_count = (f.download_count or 0) + 1
        f.last_downloaded_at = datetime.now(timezone.utc)

        # Audit Successful Download
        _audit(db, owner_id, "DOWNLOAD", f.original_name, resource_id=f.id, level="info")
        db.commit()

        return Path(temp_file.name), f.original_name

    except Exception:
        # Ensure temp file cleanup on failure
        try:
            temp_path = temp_file.name
            temp_file.close()
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
        raise
