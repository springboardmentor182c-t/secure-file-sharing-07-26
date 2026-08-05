from typing import List

from sqlalchemy import text
from sqlalchemy.orm import Session

from src.shared.models import SharedLinkResponse


def get_shared_links(db: Session) -> List[SharedLinkResponse]:
    query = text(
        """
        SELECT
            sl.id,
            f.name AS file_name,
            f.size AS file_size,
            f.mime_type,
            sl.created_at,
            sl.expires_at,
            sl.is_active,
            sl.download_count,
            sl.user_id,
            u.username
        FROM shared_links sl
        LEFT JOIN files f ON f.id = sl.file_id
        LEFT JOIN users u ON u.id = sl.user_id
        ORDER BY sl.created_at DESC
        LIMIT 20
        """
    )
    rows = db.execute(query).mappings().all()
    return [SharedLinkResponse(**row) for row in rows]
