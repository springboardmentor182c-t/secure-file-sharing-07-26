from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.entities.folder import Folder
from src.entities.file import File
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class FolderOut(BaseModel):
    id: int
    name: str
    owner_id: int
    parent_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


def list_folders(db: Session, owner_id: int, parent_id: int | None = None) -> list[FolderOut]:
    q = db.query(Folder).filter(Folder.owner_id == owner_id)
    if parent_id is not None:
        q = q.filter(Folder.parent_id == parent_id)
    else:
        q = q.filter(Folder.parent_id == None)
    return q.order_by(Folder.name).all()


def create_folder(db: Session, data: FolderCreate, owner_id: int) -> FolderOut:
    folder = Folder(name=data.name, owner_id=owner_id, parent_id=data.parent_id)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


def delete_folder(db: Session, folder_id: int, owner_id: int) -> None:
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.owner_id == owner_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    has_children = db.query(Folder.id).filter(Folder.parent_id == folder_id).first()
    if has_children:
        raise HTTPException(status_code=409, detail="Delete or move subfolders before deleting this folder")

    has_files = db.query(File.id).filter(
        File.folder_id == folder_id,
        File.is_deleted == False,
    ).first()
    if has_files:
        raise HTTPException(status_code=409, detail="Delete or move files before deleting this folder")

    # Soft-deleted files retain metadata, so detach their stale folder reference.
    db.query(File).filter(File.folder_id == folder_id).update(
        {File.folder_id: None},
        synchronize_session=False,
    )
    db.delete(folder)
    db.commit()
