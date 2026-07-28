from sqlalchemy.orm import Session
from sqlalchemy import desc, text

from src.entities.file_access_history import FileAccessHistory
from src.entities.file import File
from src.entities.file_category import FileCategory
from src.recent.models import RecentFileResponse


def get_recent_files(db: Session, limit: int = 20):
    results = (
        db.query(
            File.id,
            File.file_name,
            File.file_size,
            File.mime_type,
            FileCategory.category_name,
            FileAccessHistory.access_type,
            FileAccessHistory.accessed_at,
            FileAccessHistory.user_id,
        )
        .join(File, File.id == FileAccessHistory.file_id)
        .outerjoin(FileCategory, FileCategory.id == File.category_id)
        .filter(File.is_deleted == False)  # noqa: E712
        .order_by(desc(FileAccessHistory.accessed_at))
        .limit(limit)
        .all()
    )

    response = []
    for row in results:
        # look up the real username for THIS row's user_id
        user_row = db.execute(
            text("SELECT username FROM users WHERE id = :uid"),
            {"uid": str(row.user_id)},
        ).fetchone()
        username = user_row.username if user_row else None

        response.append(
            RecentFileResponse(
                id=row.id,
                file_name=row.file_name,
                file_size=row.file_size,
                mime_type=row.mime_type,
                category_name=row.category_name,
                access_type=row.access_type,
                accessed_at=row.accessed_at,
                user_id=row.user_id,
                username=username,
            )
        )

    return response