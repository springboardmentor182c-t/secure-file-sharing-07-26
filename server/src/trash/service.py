from typing import List

from sqlalchemy import text
from sqlalchemy.orm import Session

from src.trash.models import TrashItemResponse


def get_trash_items(db: Session) -> List[TrashItemResponse]:
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
    return [TrashItemResponse(**row) for row in rows]
