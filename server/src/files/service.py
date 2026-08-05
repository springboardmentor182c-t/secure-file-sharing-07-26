"""
Business logic for the Files module (My Files screen).

Same convention as `shared_links/service.py`: no separate repository
layer, service functions take a `db: Session` and query directly; route
handlers in `controller.py` stay thin.
"""
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Optional, Sequence, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from src.entities.file import File
from src.entities.folder import Folder
from src.entities.user import User
from src.exceptions import (
    ConflictError,
    EmptyFileError,
    NotFoundError,
    PermissionDeniedError,
    StorageQuotaExceededError,
    UnsupportedFileTypeError,
)
from src.files.constants import (
    ALLOWED_EXTENSIONS,
    MAX_UPLOAD_SIZE_BYTES,
    TRASH_RETENTION_DAYS,
    EncryptionStatus,
    FileCategory,
    SortField,
)
from src.files.encryption import decrypt_bytes, encrypt_bytes
from src.files.models import FileRead
from src.files.storage import get_storage_backend

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _split_extension(filename: str) -> tuple[str, str]:
    if "." in filename:
        stem, ext = filename.rsplit(".", 1)
        return stem, ext.lower()
    return filename, ""


def _checksum(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _active_files_query(db: Session, owner_id: uuid.UUID):
    return db.query(File).filter(File.owner_id == owner_id, File.is_deleted.is_(False))


def _assert_folder_owned(db: Session, folder_id: Optional[uuid.UUID], owner_id: uuid.UUID) -> None:
    if folder_id is None:
        return
    folder = db.get(Folder, folder_id)
    if folder is None or folder.owner_id != owner_id:
        raise NotFoundError(f"Folder {folder_id} not found")


def _assert_unique_name_in_folder(
    db: Session, *, owner_id: uuid.UUID, folder_id: Optional[uuid.UUID], name: str, exclude_file_id: Optional[uuid.UUID] = None
) -> None:
    query = _active_files_query(db, owner_id).filter(
        File.folder_id == folder_id if folder_id is not None else File.folder_id.is_(None),
        func.lower(File.original_filename) == name.lower(),
    )
    if exclude_file_id is not None:
        query = query.filter(File.id != exclude_file_id)
    if query.first() is not None:
        raise ConflictError(f'A file named "{name}" already exists in that location')


def _serialize(file_obj: File, *, is_shared: bool = False) -> FileRead:
    read = FileRead.model_validate(file_obj)
    read.is_shared = is_shared
    return read


def serialize_file(file_obj: File) -> FileRead:
    return _serialize(file_obj, is_shared=bool(file_obj.shared_links))


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------


def upload_file(
    db: Session,
    *,
    owner_id: uuid.UUID,
    filename: str,
    content_type: Optional[str],
    contents: bytes,
    folder_id: Optional[uuid.UUID] = None,
    category: FileCategory = FileCategory.OTHER,
) -> File:
    if not contents:
        raise EmptyFileError("Uploaded file is empty")

    if len(contents) > MAX_UPLOAD_SIZE_BYTES:
        from src.exceptions import FileTooLargeError
        raise FileTooLargeError(
            f"File exceeds the {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB upload limit"
        )

    stem, ext = _split_extension(filename)
    if not ext or ext not in ALLOWED_EXTENSIONS:
        raise UnsupportedFileTypeError(f"'.{ext or '?'}' files are not allowed")

    _assert_folder_owned(db, folder_id, owner_id)
    _assert_unique_name_in_folder(db, owner_id=owner_id, folder_id=folder_id, name=filename)

    checksum = _checksum(contents)
    duplicate = (
        _active_files_query(db, owner_id)
        .filter(File.checksum == checksum)
        .first()
    )
    if duplicate is not None:
        raise ConflictError(f'This file\'s content matches an existing upload: "{duplicate.original_filename}"')

    owner = db.get(User, owner_id)
    if owner is None:
        raise NotFoundError(f"User {owner_id} not found")
    used_bytes = _active_files_query(db, owner_id).with_entities(func.coalesce(func.sum(File.size), 0)).scalar()
    if used_bytes + len(contents) > owner.storage_quota_bytes:
        raise StorageQuotaExceededError("This upload would exceed your storage quota")

    encrypted = encrypt_bytes(contents)
    stored_filename = f"{uuid.uuid4()}.{ext}.enc"
    storage_backend = get_storage_backend()
    file_path = storage_backend.save(owner_id=owner_id, stored_filename=stored_filename, data=encrypted)

    file_obj = File(
        owner_id=owner_id,
        folder_id=folder_id,
        original_filename=filename,
        stored_filename=stored_filename,
        extension=ext,
        mime_type=content_type or "application/octet-stream",
        storage_provider=storage_backend.provider.value,
        file_path=file_path,
        size=len(contents),
        checksum=checksum,
        encryption_status=EncryptionStatus.ENCRYPTED.value,
        category=category.value if isinstance(category, FileCategory) else category,
    )
    db.add(file_obj)
    db.commit()
    db.refresh(file_obj)
    return file_obj


# ---------------------------------------------------------------------------
# Read / list
# ---------------------------------------------------------------------------


def get_owned_file(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID, include_deleted: bool = False) -> File:
    file_obj = db.get(File, file_id)
    if file_obj is None or file_obj.owner_id != owner_id:
        raise NotFoundError(f"File {file_id} not found")
    if file_obj.is_deleted and not include_deleted:
        raise NotFoundError(f"File {file_id} not found")
    return file_obj


def search_files(
    db: Session,
    *,
    owner_id: uuid.UUID,
    search: Optional[str] = None,
    category: Optional[FileCategory] = None,
    folder_id: Optional[uuid.UUID] = None,
    starred_only: bool = False,
    trashed_only: bool = False,
    sort_by: SortField = SortField.NEWEST,
    page: int = 1,
    page_size: int = 10,
) -> Tuple[Sequence[File], int]:
    query = db.query(File).options(selectinload(File.shared_links)).filter(
        File.owner_id == owner_id, File.is_deleted.is_(trashed_only)
    )

    if folder_id is not None:
        query = query.filter(File.folder_id == folder_id)
    if category is not None:
        query = query.filter(File.category == category.value)
    if starred_only:
        query = query.filter(File.is_starred.is_(True))
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(File.original_filename.ilike(like))

    sort_map = {
        SortField.NEWEST: File.created_at.desc(),
        SortField.OLDEST: File.created_at.asc(),
        SortField.NAME: File.original_filename.asc(),
        SortField.SIZE: File.size.asc(),
        SortField.SIZE_DESC: File.size.desc(),
    }
    query = query.order_by(sort_map.get(sort_by, File.created_at.desc()))

    total = query.count()
    files = query.offset((page - 1) * page_size).limit(page_size).all()
    return files, total


def list_files_for_response(files: Sequence[File]) -> list[FileRead]:
    return [serialize_file(f) for f in files]


# ---------------------------------------------------------------------------
# Mutations
# ---------------------------------------------------------------------------


def rename_file(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID, new_name: str) -> File:
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id)
    new_name = new_name.strip()
    if not new_name:
        raise ConflictError("File name cannot be blank")

    _assert_unique_name_in_folder(
        db, owner_id=owner_id, folder_id=file_obj.folder_id, name=new_name, exclude_file_id=file_id
    )

    _, ext = _split_extension(new_name)
    file_obj.original_filename = new_name
    if ext:
        file_obj.extension = ext
    db.commit()
    db.refresh(file_obj)
    return file_obj


def move_file(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID, folder_id: Optional[uuid.UUID]) -> File:
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id)
    _assert_folder_owned(db, folder_id, owner_id)
    _assert_unique_name_in_folder(
        db, owner_id=owner_id, folder_id=folder_id, name=file_obj.original_filename, exclude_file_id=file_id
    )
    file_obj.folder_id = folder_id
    db.commit()
    db.refresh(file_obj)
    return file_obj


def set_category(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID, category: FileCategory) -> File:
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id)
    file_obj.category = category.value
    db.commit()
    db.refresh(file_obj)
    return file_obj


def toggle_star(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID) -> File:
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id)
    file_obj.is_starred = not file_obj.is_starred
    db.commit()
    db.refresh(file_obj)
    return file_obj


def delete_file(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID) -> File:
    """Soft delete - moves the file to Trash. See `purge_expired_trash` for
    the eventual, real removal from storage."""
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id)
    file_obj.is_deleted = True
    file_obj.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(file_obj)
    return file_obj


def restore_file(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID) -> File:
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id, include_deleted=True)
    if not file_obj.is_deleted:
        raise ConflictError("File is not in Trash")

    name = file_obj.original_filename
    conflict = _active_files_query(db, owner_id).filter(
        File.folder_id == file_obj.folder_id if file_obj.folder_id is not None else File.folder_id.is_(None),
        func.lower(File.original_filename) == name.lower(),
    ).first()
    if conflict is not None:
        stem, ext = _split_extension(name)
        name = f"{stem} (restored){f'.{ext}' if ext else ''}"
        file_obj.original_filename = name

    file_obj.is_deleted = False
    file_obj.deleted_at = None
    db.commit()
    db.refresh(file_obj)
    return file_obj


def permanently_delete_file(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID) -> None:
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id, include_deleted=True)
    get_storage_backend().delete(file_obj.file_path)
    db.delete(file_obj)
    db.commit()


def purge_expired_trash(db: Session) -> int:
    """Permanently removes (DB row + storage blob) any file that's been in
    Trash longer than TRASH_RETENTION_DAYS. Intended to be run periodically
    (see src/files/scheduler.py), mirroring how shared_links expires links."""
    cutoff = datetime.utcnow() - timedelta(days=TRASH_RETENTION_DAYS)
    expired = db.query(File).filter(File.is_deleted.is_(True), File.deleted_at <= cutoff).all()
    backend = get_storage_backend()
    for file_obj in expired:
        backend.delete(file_obj.file_path)
        db.delete(file_obj)
    db.commit()
    return len(expired)


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------


def download_file(db: Session, *, file_id: uuid.UUID, owner_id: uuid.UUID) -> tuple[str, str, bytes]:
    file_obj = get_owned_file(db, file_id=file_id, owner_id=owner_id)
    raw = get_storage_backend().read(file_obj.file_path)
    plaintext = decrypt_bytes(raw) if file_obj.encryption_status == EncryptionStatus.ENCRYPTED.value else raw

    file_obj.download_count += 1
    db.commit()

    return file_obj.original_filename, file_obj.mime_type, plaintext


# ---------------------------------------------------------------------------
# Storage statistics
# ---------------------------------------------------------------------------


def get_storage_stats(db: Session, owner_id: uuid.UUID) -> dict:
    owner = db.get(User, owner_id)
    if owner is None:
        raise NotFoundError(f"User {owner_id} not found")

    used_bytes = _active_files_query(db, owner_id).with_entities(func.coalesce(func.sum(File.size), 0)).scalar()
    file_count = _active_files_query(db, owner_id).count()
    folder_count = db.query(Folder).filter(Folder.owner_id == owner_id).count()
    total_bytes = owner.storage_quota_bytes

    return {
        "used_bytes": int(used_bytes),
        "total_bytes": int(total_bytes),
        "remaining_bytes": max(0, int(total_bytes) - int(used_bytes)),
        "used_percent": round((used_bytes / total_bytes) * 100, 2) if total_bytes else 0.0,
        "file_count": file_count,
        "folder_count": folder_count,
    }


# ---------------------------------------------------------------------------
# Folders
# ---------------------------------------------------------------------------


def count_files_in_folder(db: Session, *, owner_id: uuid.UUID, folder_id: uuid.UUID) -> int:
    return _active_files_query(db, owner_id).filter(File.folder_id == folder_id).count()


def create_folder(db: Session, *, owner_id: uuid.UUID, name: str, parent_id: Optional[uuid.UUID]) -> Folder:
    _assert_folder_owned(db, parent_id, owner_id)

    existing = (
        db.query(Folder)
        .filter(
            Folder.owner_id == owner_id,
            Folder.parent_id == parent_id if parent_id is not None else Folder.parent_id.is_(None),
            func.lower(Folder.name) == name.lower(),
        )
        .first()
    )
    if existing is not None:
        raise ConflictError(f'A folder named "{name}" already exists here')

    folder = Folder(owner_id=owner_id, parent_id=parent_id, name=name)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


def list_folders(db: Session, *, owner_id: uuid.UUID, parent_id: Optional[uuid.UUID] = None) -> list[dict]:
    query = db.query(Folder).filter(Folder.owner_id == owner_id)
    if parent_id is not None:
        query = query.filter(Folder.parent_id == parent_id)
    folders = query.order_by(Folder.name.asc()).all()

    counts = dict(
        db.query(File.folder_id, func.count(File.id))
        .filter(File.owner_id == owner_id, File.is_deleted.is_(False), File.folder_id.isnot(None))
        .group_by(File.folder_id)
        .all()
    )
    return [{"folder": f, "file_count": counts.get(f.id, 0)} for f in folders]


def get_owned_folder(db: Session, *, folder_id: uuid.UUID, owner_id: uuid.UUID) -> Folder:
    folder = db.get(Folder, folder_id)
    if folder is None or folder.owner_id != owner_id:
        raise NotFoundError(f"Folder {folder_id} not found")
    return folder


def rename_folder(db: Session, *, folder_id: uuid.UUID, owner_id: uuid.UUID, name: str) -> Folder:
    folder = get_owned_folder(db, folder_id=folder_id, owner_id=owner_id)
    existing = (
        db.query(Folder)
        .filter(
            Folder.owner_id == owner_id,
            Folder.parent_id == folder.parent_id if folder.parent_id is not None else Folder.parent_id.is_(None),
            func.lower(Folder.name) == name.lower(),
            Folder.id != folder_id,
        )
        .first()
    )
    if existing is not None:
        raise ConflictError(f'A folder named "{name}" already exists here')
    folder.name = name
    db.commit()
    db.refresh(folder)
    return folder


def delete_folder(db: Session, *, folder_id: uuid.UUID, owner_id: uuid.UUID) -> None:
    folder = get_owned_folder(db, folder_id=folder_id, owner_id=owner_id)

    child_count = db.query(Folder).filter(Folder.parent_id == folder_id).count()
    if child_count > 0:
        raise ConflictError("Delete or move this folder's subfolders first")

    # Files directly inside move to root rather than being deleted, so
    # deleting a folder is never a surprise way to lose data.
    db.query(File).filter(File.folder_id == folder_id).update({File.folder_id: None})
    db.delete(folder)
    db.commit()
