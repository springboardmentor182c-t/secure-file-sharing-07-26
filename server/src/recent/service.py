from typing import List

from sqlalchemy import text
from sqlalchemy.orm import Session

from src.recent.models import RecentFileResponse


def get_recent_files(db: Session) -> List[RecentFileResponse]:
    query = text(
        """
        SELECT
            f.id,
            f.name AS file_name,
            f.size AS file_size,
            f.mime_type,
            c.name AS category_name,
            f.access_type,
            f.accessed_at,
            f.user_id,
            u.username
        FROM files f
        LEFT JOIN categories c ON c.id = f.category_id
        LEFT JOIN users u ON u.id = f.user_id
        WHERE f.accessed_at IS NOT NULL
        ORDER BY f.accessed_at DESC
        LIMIT 20
        """
    )
    rows = db.execute(query).mappings().all()
    return [RecentFileResponse(**row) for row in rows]
