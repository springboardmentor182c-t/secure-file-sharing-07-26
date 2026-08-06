from typing import List
from uuid import UUID
from sqlalchemy import text
from sqlalchemy.orm import Session
from src.trash.models import TrashItemResponse
from src.entities.file import File


def get_trash_items(db: Session) -> List[TrashItemResponse]:
    try:
        query = text(
            """
            SELECT
                t.id,
                f.name AS file_name,
                f.size AS file_size,
                f.mime_type,
                t.deleted_at,
                t.user_id,
                u.username
            FROM trash t
            LEFT JOIN files f ON f.id = t.file_id
            LEFT JOIN users u ON u.id = t.user_id
            ORDER BY t.deleted_at DESC
            LIMIT 20
            """
        )
        rows = db.execute(query).mappings().all()
        if rows:
            return [TrashItemResponse(**row) for row in rows]
    except Exception:
        pass
    return []


class TrashService:
    def __init__(self, db: Session):
        self.db = db

    def get_deleted_files(self):
        try:
            return self.db.query(File).filter(File.is_deleted == True).all()
        except Exception:
            return []

    def restore_file(self, file_id: UUID):
        try:
            file = self.db.query(File).filter(File.id == file_id).first()
            if file:
                file.is_deleted = False
                self.db.commit()
                self.db.refresh(file)
                return file
        except Exception:
            pass
        return None

    def delete_file(self, file_id: UUID):
        try:
            file = self.db.query(File).filter(File.id == file_id).first()
            if file:
                self.db.delete(file)
                self.db.commit()
                return True
        except Exception:
            pass
        return False

    def empty_trash(self):
        try:
            deleted_files = self.db.query(File).filter(File.is_deleted == True).all()
            count = len(deleted_files)
            for file in deleted_files:
                self.db.delete(file)
            self.db.commit()
            return count
        except Exception:
            return 0
