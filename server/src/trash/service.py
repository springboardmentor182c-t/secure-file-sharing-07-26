from uuid import UUID
from sqlalchemy.orm import Session
from src.entities.file import File


class TrashService:
    def __init__(self, db: Session):
        self.db = db

    # Get all deleted files
    def get_deleted_files(self):
        return (
            self.db.query(File)
            .filter(File.is_deleted == True)
            .all()
        )

    # Restore a deleted file
    def restore_file(self, file_id: UUID):
        file = (
            self.db.query(File)
            .filter(File.id == file_id)
            .first()
        )

        if file is None:
            return None

        file.is_deleted = False

        self.db.commit()
        self.db.refresh(file)

        return file

    # Permanently delete a file
    def delete_file(self, file_id: UUID):
        file = (
            self.db.query(File)
            .filter(File.id == file_id)
            .first()
        )

        if file is None:
            return False

        self.db.delete(file)
        self.db.commit()

        return True

    # Empty the trash
    def empty_trash(self):
        deleted_files = (
            self.db.query(File)
            .filter(File.is_deleted == True)
            .all()
        )

        count = len(deleted_files)

        for file in deleted_files:
            self.db.delete(file)

        self.db.commit()

        return count