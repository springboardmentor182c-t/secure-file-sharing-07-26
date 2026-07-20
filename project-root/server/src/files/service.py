# server/src/files/service.py

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

from src.security.validation.validators import validate_upload
from src.security.key_manager import (
    generate_key,
    save_key,
    load_key,
    delete_key,
)
from src.security.encryption import encrypt_bytes, decrypt_bytes
from src.security.secure_storage import (
    save_encrypted_file,
    load_encrypted_file,
    delete_encrypted_file,
)
from src.security.hashing import calculate_sha256

# ── Analytics event logger ────────────────────────────────────────────────
from src.analytics.services import log_event
from src.analytics.constants import (
    AnalyticsEventType,
    AnalyticsEventStatus,
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ═══════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from uploaded filenames."""
    filename = Path(filename).name
    filename = re.sub(r'[<>:"/\\|?*\x00-\x1F]', "_", filename)
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
    ip_address: str | None = None,
):
    """
    Detect repeated unauthorized access attempts.
    Logs SECURITY analytics event if threshold crossed.
    """
    failed_attempts = (
        db.query(AuditLog)
        .filter(
            AuditLog.user_id == user_id,
            AuditLog.action.in_([
                "UNAUTHORIZED_ACCESS",
                "UNAUTHORIZED_DOWNLOAD",
            ]),
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

        # ── Log SECURITY event with brute_force severity ─────────────────
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=user_id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "brute_force",
                "label": "Suspicious file access detected",
                "detail": f"{failed_attempts} unauthorized file access attempts",
                "target": f"user_{user_id}",
                "attempts": failed_attempts,
            },
        )


# ═══════════════════════════════════════════════════════════════════════════
# LIST FILES
# ═══════════════════════════════════════════════════════════════════════════

def get_user_files(
    db: Session,
    owner_id: int,
    folder_id: int | None = None,
) -> list[File]:
    q = db.query(File).filter(
        File.owner_id == owner_id,
        File.is_deleted == False,
    )
    if folder_id is not None:
        q = q.filter(File.folder_id == folder_id)
    else:
        q = q.filter(File.folder_id == None)
    return q.order_by(File.created_at.desc()).all()


# ═══════════════════════════════════════════════════════════════════════════
# GET FILE (with ownership check)
# ═══════════════════════════════════════════════════════════════════════════

def get_file(
    db: Session,
    file_id: int,
    owner_id: int,
    ip_address: str | None = None,
) -> File:
    file = (
        db.query(File)
        .filter(File.id == file_id, File.is_deleted == False)
        .first()
    )

    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Owner authorization
    if file.owner_id != owner_id:
        _audit(
            db,
            owner_id,
            "UNAUTHORIZED_ACCESS",
            f.original_name,
            resource_id=f.id,
            level="warning",
        )
        _detect_suspicious_activity(db, owner_id, ip_address=ip_address)

        # ── Log SECURITY event ─────────────────────────────────────────
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=owner_id,
            file_id=file.id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "unusual_access",
                "label": "Unauthorized file access",
                "detail": f"User attempted to access file {file.original_name}",
                "target": file.original_name,
                "attempts": 1,
            },
        )

        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this file.",
        )

    return f

# ═══════════════════════════════════════════════════════════════════════════
# UPLOAD
# ═══════════════════════════════════════════════════════════════════════════

def upload_file(
    db: Session,
    upload: UploadFile,
    owner_id: int,
    folder_id: int | None,
    encrypted: bool,
    ip_address: str | None = None,
) -> File:
    # Read uploaded file
    upload.file.seek(0)
    file_bytes = upload.file.read()
    file_size = len(file_bytes)
    upload.file.seek(0)

    # ── Validate upload (log FAILED analytics event if invalid) ───────────
    try:
        validate_upload(db, upload, file_size)
    except HTTPException as e:
        log_event(
            db,
            event_type=AnalyticsEventType.UPLOAD,
            user_id=owner_id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "unusual_access",
                "label": "File upload rejected",
                "detail": e.detail if hasattr(e, "detail") else "Validation failed",
                "target": upload.filename,
                "attempts": 1,
            },
        )
        db.commit()
        raise

    # Sanitize filename
    safe_filename = sanitize_filename(upload.filename)

    # Unique storage filename
    stored_name = f"{uuid.uuid4().hex}{Path(safe_filename).suffix.lower()}"

    # Encrypt file
    if encrypted:
        aes_key = generate_key()
        save_key(stored_name, aes_key)
        stored_bytes = encrypt_bytes(file_bytes, aes_key)
    else:
        stored_bytes = file_bytes

    # Store encrypted file
    save_encrypted_file(stored_name, stored_bytes)

    # SHA-256 integrity hash
    hash_sha256 = hashlib.sha256(file_bytes).hexdigest()

    # Detect MIME type
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
    db.flush()  # Generate PK before audit log

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

    # ── Log UPLOAD analytics event ─────────────────────────────────────────
    log_event(
        db,
        event_type=AnalyticsEventType.UPLOAD,
        user_id=owner_id,
        file_id=file.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "target": safe_filename,
            "size_bytes": file_size,
            "mimetype": mimetype,
            "encrypted": encrypted,
        },
    )

    db.commit()
    db.refresh(file)

    return file


# ═══════════════════════════════════════════════════════════════════════════
# DELETE
# ═══════════════════════════════════════════════════════════════════════════

def delete_file(
    db: Session,
    file_id: int,
    owner_id: int,
    ip_address: str | None = None,
) -> None:
    # Fetch file (uses ownership check)
    file = get_file(db, file_id, owner_id, ip_address=ip_address)

    if file.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    # Delete encrypted file
    try:
        delete_encrypted_file(file.stored_name)
    except Exception:
        # best-effort
        pass

    # Delete AES key
    if file.encrypted:
        try:
            delete_key(file.stored_name)
        except Exception:
            pass

    # Soft delete metadata
    file.is_deleted = True

    # Update storage usage
    user = db.query(User).filter(User.id == owner_id).first()
    if user:
        user.storage_used = max(0, user.storage_used - file.size)

    # Audit log
    _audit(
        db,
        owner_id,
        "DELETE",
        f.original_name,
        resource_id=f.id,
        level="warn",
    )

    # ── Log DELETE analytics event ─────────────────────────────────────────
    log_event(
        db,
        event_type=AnalyticsEventType.DELETE,
        user_id=owner_id,
        file_id=file.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "target": file.original_name,
            "size_bytes": file.size,
        },
    )

    db.commit()


# ═══════════════════════════════════════════════════════════════════════════
# DOWNLOAD (decrypts + integrity check)
# ═══════════════════════════════════════════════════════════════════════════

def get_file_path(
    db: Session,
    file_id: int,
    owner_id: int,
    ip_address: str | None = None,
) -> tuple[Path, str]:
    # Fetch file metadata
    file = (
        db.query(File)
        .filter(File.id == file_id, File.is_deleted == False)
        .first()
    )

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Load stored (encrypted) file
    try:
        encrypted_bytes = load_encrypted_file(file.stored_name)
    except Exception:
        _audit(
            db,
            owner_id,
            "ENCRYPTED_FILE_MISSING",
            file.original_name,
            resource_id=file.id,
            level="critical",
        )
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=owner_id,
            file_id=file.id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "unusual_access",
                "label": "Encrypted file missing",
                "detail": f"Storage file not found for {file.original_name}",
                "target": file.original_name,
                "attempts": 1,
            },
        )
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Encrypted file not found.",
        )

    # Decrypt only if encrypted
    if file.encrypted:
        try:
            aes_key = load_key(file.stored_name)
        except Exception:
            _audit(
                db,
                owner_id,
                "KEY_NOT_FOUND",
                file.original_name,
                resource_id=file.id,
                level="critical",
            )
            log_event(
                db,
                event_type=AnalyticsEventType.SECURITY,
                user_id=owner_id,
                file_id=file.id,
                status=AnalyticsEventStatus.FAILED,
                ip_address=ip_address,
                event_metadata={
                    "severity_key": "unusual_access",
                    "label": "Encryption key not found",
                    "detail": f"AES key missing for {file.original_name}",
                    "target": file.original_name,
                    "attempts": 1,
                },
            )
            db.commit()
            raise HTTPException(
                status_code=500,
                detail="Encryption key not found.",
            )

        try:
            decrypted_bytes = decrypt_bytes(encrypted_bytes, aes_key)
        except Exception:
            _audit(
                db,
                owner_id,
                "DECRYPTION_FAILED",
                file.original_name,
                resource_id=file.id,
                level="critical",
            )
            log_event(
                db,
                event_type=AnalyticsEventType.SECURITY,
                user_id=owner_id,
                file_id=file.id,
                status=AnalyticsEventStatus.FAILED,
                ip_address=ip_address,
                event_metadata={
                    "severity_key": "brute_force",
                    "label": "Decryption failed",
                    "detail": f"Failed to decrypt {file.original_name}",
                    "target": file.original_name,
                    "attempts": 1,
                },
            )
            db.commit()
            raise HTTPException(
                status_code=500,
                detail="Unable to decrypt file.",
            )
    else:
        decrypted_bytes = encrypted_bytes

    # Write to temp file
    temp_file = NamedTemporaryFile(
        delete=False,
        suffix=Path(file.original_name).suffix,
    )
    temp_file.write(decrypted_bytes)
    temp_file.close()

    # Verify integrity
    sha256 = hashlib.sha256()
    sha256.update(decrypted_bytes)
    calculated_hash = sha256.hexdigest()

    if calculated_hash != file.hash_sha256:
        _audit(
            db,
            owner_id,
            "INTEGRITY_FAILURE",
            file.original_name,
            resource_id=file.id,
            level="critical",
        )
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=owner_id,
            file_id=file.id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "brute_force",
                "label": "File integrity failure",
                "detail": f"SHA-256 mismatch on {file.original_name}",
                "target": file.original_name,
                "attempts": 1,
            },
        )
        db.commit()
        os.remove(temp_file.name)
        raise HTTPException(
            status_code=500,
            detail="File integrity verification failed.",
        )

    # Download tracking
    file.download_count += 1
    file.last_downloaded_at = datetime.now(timezone.utc)

    # Audit log
    _audit(
        db,
        owner_id,
        "DOWNLOAD",
        file.original_name,
        resource_id=file.id,
        level="info",
    )

    # ── Log DOWNLOAD analytics event ───────────────────────────────────────
    log_event(
        db,
        event_type=AnalyticsEventType.DOWNLOAD,
        user_id=owner_id,
        file_id=file.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "target": file.original_name,
            "size_bytes": file.size,
        },
    )

    db.commit()

    return Path(temp_file.name), file.original_name


# ═══════════════════════════════════════════════════════════════════════════
# ROTATE ENCRYPTION KEY
# ═══════════════════════════════════════════════════════════════════════════

def rotate_file_key(
    db: Session,
    file_id: int,
    owner_id: int,
    ip_address: str | None = None,
) -> None:
    """
    Rotate the AES-256 encryption key for a file.
    """
    file = get_file(db, file_id, owner_id, ip_address=ip_address)

    encrypted_bytes = load_encrypted_file(file.stored_name)
    current_key = load_key(file.stored_name)
    decrypted_bytes = decrypt_bytes(encrypted_bytes, current_key)

    new_key = generate_key()
    new_encrypted_bytes = encrypt_bytes(decrypted_bytes, new_key)

    save_encrypted_file(file.stored_name, new_encrypted_bytes)

    # Atomic key replacement with rollback safety
    try:
        save_key(file.stored_name, new_key)
    except Exception as e:
        try:
            save_encrypted_file(file.stored_name, encrypted_bytes)
        except Exception:
            _audit(
                db,
                owner_id,
                "KEY_ROTATION_FAILED_UNRECOVERABLE",
                file.original_name,
                resource_id=file.id,
                level="critical",
            )
            log_event(
                db,
                event_type=AnalyticsEventType.SECURITY,
                user_id=owner_id,
                file_id=file.id,
                status=AnalyticsEventStatus.FAILED,
                ip_address=ip_address,
                event_metadata={
                    "severity_key": "brute_force",
                    "label": "Key rotation failed (unrecoverable)",
                    "detail": f"File {file.original_name} may be corrupted",
                    "target": file.original_name,
                    "attempts": 1,
                },
            )
            db.commit()
            raise KeyManagementError(
                f"Key rotation failed and rollback failed. "
                f"File {file.id} may be corrupted: {e}"
            )

        _audit(
            db,
            owner_id,
            "KEY_ROTATION_FAILED",
            file.original_name,
            resource_id=file.id,
            level="error",
        )
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=owner_id,
            file_id=file.id,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "unusual_access",
                "label": "Key rotation failed",
                "detail": f"Rolled back key rotation for {file.original_name}",
                "target": file.original_name,
                "attempts": 1,
            },
        )
        db.commit()
        raise KeyManagementError(
            f"Key rotation failed, rolled back to previous key: {e}"
        )

    # Audit + analytics for success
    _audit(
        db,
        owner_id,
        "KEY_ROTATION",
        file.original_name,
        resource_id=file.id,
        level="info",
    )
    log_event(
        db,
        event_type=AnalyticsEventType.SECURITY,
        user_id=owner_id,
        file_id=file.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "severity_key": "admin_role",
            "label": "Encryption key rotated",
            "detail": f"AES-256 key rotated for {file.original_name}",
            "target": file.original_name,
            "attempts": 1,
        },
    )

    db.commit()
