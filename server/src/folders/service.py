import uuid
import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.entities.folder import Folder
from src.entities.file import File
from src.entities.user import User
from src.entities.audit_log import AuditLog

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
        resource_type="folder",
        resource_id=str(resource_id) if resource_id else None,
        resource_name=resource_name,
        level=level,
    )
    db.add(log)


def _get_folder_or_404(db: Session, folder_id: uuid.UUID) -> Folder:
    f = db.query(Folder).filter(Folder.id == folder_id).first()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return f


def _assert_owner(folder: Folder, owner_id: uuid.UUID) -> None:
    if folder.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")


# ── Shared helpers ────────────────────────────────────────────────────────────

def get_folder_path_on_disk(db: Session, folder_id: uuid.UUID | None) -> Path:
    """Recursively resolve the nested folder path on disk under the uploads directory."""
    if not folder_id:
        return UPLOAD_DIR
    
    parts = []
    curr_id = folder_id
    while curr_id:
        folder = db.query(Folder).filter(Folder.id == curr_id).first()
        if not folder:
            break
        parts.insert(0, folder.name)
        curr_id = folder.parent_id
        
    return UPLOAD_DIR.joinpath(*parts)


# ── Public service functions ──────────────────────────────────────────────────

def get_user_folders(
    db: Session,
    owner_id: uuid.UUID,
    parent_id: uuid.UUID | None = None,
) -> list:
    """Return all folders owned by the user, each enriched with file_count and total_size."""
    q = db.query(Folder).filter(Folder.owner_id == owner_id)
    if parent_id is not None:
        q = q.filter(Folder.parent_id == parent_id)
    else:
        q = q.filter(Folder.parent_id == None)
    folders = q.order_by(Folder.created_at.asc()).all()

    # Enrich each folder with live file stats
    result = []
    for folder in folders:
        files = db.query(File).filter(File.folder_id == folder.id, File.is_deleted == False).all()
        enriched = {
            "id": folder.id,
            "name": folder.name,
            "owner_id": folder.owner_id,
            "parent_id": folder.parent_id,
            "file_count": len(files),
            "total_size": sum(f.size for f in files),
            "created_at": folder.created_at,
            "updated_at": folder.updated_at,
        }
        result.append(enriched)
    return result


def create_folder(
    db: Session,
    owner_id: uuid.UUID,
    name: str,
    parent_id: uuid.UUID | None,
) -> Folder:
    """Create a new folder. Validates that parent (if given) belongs to the user."""
    if parent_id is not None:
        parent = _get_folder_or_404(db, parent_id)
        _assert_owner(parent, owner_id)

    # Prevent duplicate names within the same parent
    existing = (
        db.query(Folder)
        .filter(
            Folder.owner_id == owner_id,
            Folder.name == name,
            Folder.parent_id == parent_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A folder named '{name}' already exists here",
        )

    folder = Folder(name=name, owner_id=owner_id, parent_id=parent_id)
    db.add(folder)
    db.commit()
    db.refresh(folder)

    # Create the physical directory on disk
    path = get_folder_path_on_disk(db, folder.id)
    path.mkdir(parents=True, exist_ok=True)

    _audit(db, owner_id, "CREATE_FOLDER", name, level="info")
    return folder


def rename_folder(
    db: Session,
    folder_id: uuid.UUID,
    owner_id: uuid.UUID,
    new_name: str,
) -> Folder:
    """Rename a folder and move its physical directory on disk."""
    folder = _get_folder_or_404(db, folder_id)
    _assert_owner(folder, owner_id)
    
    old_path = get_folder_path_on_disk(db, folder.id)
    old_name = folder.name
    folder.name = new_name
    db.commit()
    
    new_path = get_folder_path_on_disk(db, folder.id)
    
    # Move physical directory
    if old_path.exists() and old_path != new_path:
        try:
            new_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(old_path), str(new_path))
        except Exception:
            pass  # Avoid crash if directory moving fails

    _audit(db, owner_id, "RENAME_FOLDER", f"{old_name} -> {new_name}", resource_id=folder_id, level="info")
    db.refresh(folder)
    return folder


def delete_folder(db: Session, folder_id: uuid.UUID, owner_id: uuid.UUID) -> None:
    """
    Delete a folder.
    - Removes physical directory from disk.
    - Hard-deletes all subfolders and files inside it from DB.
    """
    folder = _get_folder_or_404(db, folder_id)
    _assert_owner(folder, owner_id)

    path = get_folder_path_on_disk(db, folder.id)

    _delete_folder_recursive(db, folder, owner_id)

    # Delete physical directory
    if path.exists():
        try:
            shutil.rmtree(path)
        except OSError:
            pass

    _audit(db, owner_id, "DELETE_FOLDER", folder.name, resource_id=folder_id, level="warn")
    db.commit()


def _delete_folder_recursive(db: Session, folder: Folder, owner_id: uuid.UUID) -> None:
    """Recursively delete files (DB records) and subfolders."""
    # Free up storage quota for user for each file being deleted
    files = db.query(File).filter(File.folder_id == folder.id).all()
    user = db.query(User).filter(User.id == owner_id).first()
    for f in files:
        if user and user.storage_used >= f.size:
            user.storage_used -= f.size
        db.delete(f)

    # Recurse into sub-folders
    children = db.query(Folder).filter(Folder.parent_id == folder.id).all()
    for child in children:
        _delete_folder_recursive(db, child, owner_id)

    db.delete(folder)
