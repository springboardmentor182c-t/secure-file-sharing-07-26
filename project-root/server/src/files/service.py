import os
import re
import uuid
import hashlib
import mimetypes

from pathlib import Path

from sqlalchemy.orm import Session
from datetime import datetime, timezone
from fastapi import HTTPException, UploadFile, status

from src.entities.file import File
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

UPLOAD_DIR = Path("uploads")
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


def get_file(
    db: Session,
    file_id: int,
    owner_id: int,
) -> File:

    file = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.is_deleted == False,
        )
        .first()
    )

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    # Owner Authorization

    if file.owner_id != owner_id:

        _audit(
            db,
            owner_id,
            "UNAUTHORIZED_ACCESS",
            file.original_name,
            resource_id=file.id,
            level="warning",
        )
        _detect_suspicious_activity(
            db,
            owner_id,
        )

        db.commit()

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this file.",
        )

    return file


def upload_file(
    db: Session,
    upload: UploadFile,
    owner_id: int,
    folder_id: int | None,
    encrypted: bool,
) -> File:

    # Read uploaded file

    upload.file.seek(0)
    file_bytes = upload.file.read()
    file_size = len(file_bytes)
    upload.file.seek(0)

    # Validate upload

    validate_upload(db, upload, file_size,)

    # Sanitize filename

    safe_filename = sanitize_filename(upload.filename)

    # Generate unique storage filename

    stored_name = f"{uuid.uuid4().hex}" f"{Path(safe_filename).suffix.lower()}"

    # Encrypt file

    if encrypted:

        aes_key = generate_key()

        save_key(stored_name, aes_key)

        stored_bytes = encrypt_bytes(
            file_bytes,
            aes_key,
        )

    else:

        stored_bytes = file_bytes

    # Store encrypted file

    save_encrypted_file(
        stored_name,
        stored_bytes,
    )

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
        user.storage_used += file_size

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


def delete_file(
    db: Session,
    file_id: int,
    owner_id: int,
) -> None:

    # Fetch File

    file = get_file(
        db,
        file_id,
        owner_id,
    )

    if file.owner_id != owner_id:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    # Delete Encrypted File

    try:

        delete_encrypted_file(file.stored_name)

    except Exception:
        pass

    # Delete AES Key

    if file.encrypted:

        try:

            delete_key(file.stored_name)

        except Exception:
            pass

    # Soft Delete Metadata

    file.is_deleted = True

    # Update Storage Usage

    user = db.query(User).filter(User.id == owner_id).first()

    if user:

        user.storage_used = max(
            0,
            user.storage_used - file.size,
        )

    # Audit Log

    _audit(
        db,
        owner_id,
        "DELETE",
        file.original_name,
        resource_id=file.id,
        level="warn",
    )

    db.commit()


from tempfile import NamedTemporaryFile


def get_file_path(
    db: Session,
    file_id: int,
    owner_id: int,
) -> tuple[Path, str]:

    # Fetch File Metadata

    file = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.is_deleted == False,
        )
        .first()
    )

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found",
        )

    # Load Stored File

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

        db.commit()

        raise HTTPException(
            status_code=500,
            detail="Encrypted file not found.",
        )

    # Decrypt only if encrypted

    if file.encrypted:

        try:

            aes_key = load_key(
                file.stored_name,
            )

        except Exception:

            _audit(
                db,
                owner_id,
                "KEY_NOT_FOUND",
                file.original_name,
                resource_id=file.id,
                level="critical",
            )

            db.commit()

            raise HTTPException(
                status_code=500,
                detail="Encryption key not found.",
            )

        try:

            decrypted_bytes = decrypt_bytes(
                encrypted_bytes,
                aes_key,
            )

        except Exception:

            _audit(
                db,
                owner_id,
                "DECRYPTION_FAILED",
                file.original_name,
                resource_id=file.id,
                level="critical",
            )

            db.commit()

            raise HTTPException(
                status_code=500,
                detail="Unable to decrypt file.",
            )

    else:

        decrypted_bytes = encrypted_bytes

    # Integrity Verification

    temp_file = NamedTemporaryFile(
        delete=False,
        suffix=Path(file.original_name).suffix,
    )

    temp_file.write(decrypted_bytes)

    temp_file.close()

    # Verify Original Integrity

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

        db.commit()

        os.remove(temp_file.name)

        raise HTTPException(
            status_code=500,
            detail="File integrity verification failed.",
        )

    # Download Tracking

    file.download_count += 1
    file.last_downloaded_at = datetime.now(timezone.utc)

    # Audit Successful Download

    _audit(
        db,
        owner_id,
        "DOWNLOAD",
        file.original_name,
        resource_id=file.id,
        level="info",
    )

    db.commit()

    # Return Temporary Decrypted File

    return (
        Path(temp_file.name),
        file.original_name,
    )


def rotate_file_key(
    db: Session,
    file_id: int,
    owner_id: int,
) -> None:
    """
    Rotate the AES-256 encryption key for a file.

    Workflow:
    1. Verify ownership.
    2. Load encrypted file.
    3. Load current AES key.
    4. Decrypt file.
    5. Generate a new AES key.
    6. Re-encrypt file.
    7. Atomically replace encrypted file.
    8. Atomically replace encryption key
       (rolls back the encrypted file if this step fails,
       since a mismatched file/key pair is unrecoverable).
    9. Record audit log.
    """

    # Verify ownership

    file = get_file(
        db,
        file_id,
        owner_id,
    )

    # Load encrypted file

    encrypted_bytes = load_encrypted_file(
        file.stored_name,
    )

    # Load current AES key

    current_key = load_key(
        file.stored_name,
    )

    # Decrypt file

    decrypted_bytes = decrypt_bytes(
        encrypted_bytes,
        current_key,
    )

    # Generate new AES key

    new_key = generate_key()

    # Encrypt with new key

    new_encrypted_bytes = encrypt_bytes(
        decrypted_bytes,
        new_key,
    )

    # Atomically replace encrypted file

    save_encrypted_file(
        file.stored_name,
        new_encrypted_bytes,
    )

    # -------------------------------------------------------
    # Atomically replace encryption key.
    #
    # save_key() being atomic only guarantees the key file itself
    # is never left partially written. It does NOT guarantee the
    # (encrypted file, key) pair stays in sync. If this write fails
    # after the encrypted file has already been replaced above, the
    # file on disk would be encrypted with new_key while the old_key
    # remains stored — an unrecoverable mismatch. So we roll back the
    # encrypted file to its previous state if this step fails.
    # -------------------------------------------------------

    try:

        save_key(
            file.stored_name,
            new_key,
        )

    except Exception as e:

        try:

            # Restore the previous ciphertext so the file still
            # matches the key that remains on disk.
            save_encrypted_file(
                file.stored_name,
                encrypted_bytes,
            )

        except Exception:

            # Rollback itself failed — the file may now be
            # undecryptable with any key on disk. This must be
            # flagged as critical for manual investigation.
            _audit(
                db,
                owner_id,
                "KEY_ROTATION_FAILED_UNRECOVERABLE",
                file.original_name,
                resource_id=file.id,
                level="critical",
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
        db.commit()

        raise KeyManagementError(
            f"Key rotation failed, rolled back to previous key: {e}"
        )

    # Audit Log

    _audit(
        db,
        owner_id,
        "KEY_ROTATION",
        file.original_name,
        resource_id=file.id,
        level="info",
    )

    db.commit()
