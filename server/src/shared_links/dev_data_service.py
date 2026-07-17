
import os
import uuid
from typing import Sequence

from fastapi import UploadFile
from sqlalchemy.orm import Session

from src.entities.file import File
from src.entities.user import User
from src.exceptions import ConflictError, NotFoundError
from src.shared_links.models import UserCreate

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_UPLOAD_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50")) * 1024 * 1024


def create_user(db: Session, data: UserCreate) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise ConflictError(f"A user with email {data.email} already exists")
    user = User(email=data.email, full_name=data.full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session) -> Sequence[User]:
    return db.query(User).all()


def upload_file(db: Session, *, owner_id: uuid.UUID, upload: UploadFile) -> File:
    contents = upload.file.read()
    if len(contents) > MAX_UPLOAD_SIZE_BYTES:
        from src.exceptions import FileTooLargeError
        raise FileTooLargeError("File exceeds the configured upload limit")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4()}_{upload.filename}"
    storage_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(storage_path, "wb") as f:
        f.write(contents)

    file_type = upload.filename.rsplit(".", 1)[-1].lower() if "." in upload.filename else "file"

    file_obj = File(
        owner_id=owner_id, file_name=upload.filename, file_type=file_type,
        storage_path=storage_path, size_bytes=len(contents), content_type=upload.content_type,
    )
    db.add(file_obj)
    db.commit()
    db.refresh(file_obj)
    return file_obj


def list_files_for_owner(db: Session, owner_id: uuid.UUID) -> Sequence[File]:
    return db.query(File).filter(File.owner_id == owner_id).all()


def get_file(db: Session, file_id: uuid.UUID) -> File:
    file_obj = db.get(File, file_id)
    if file_obj is None:
        raise NotFoundError(f"File {file_id} not found")
    return file_obj
