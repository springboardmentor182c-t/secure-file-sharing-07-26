from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.entities.file import File
from src.entities.folder import Folder
from src.entities.share_link import ShareLink
from src.entities.notification import Notification


def global_search(db: Session, user_id: int, query: str):

    q = query.strip()

    files = (
        db.query(File)
        .filter(
            File.owner_id == user_id,
            File.is_deleted == False,
            File.original_name.ilike(f"%{q}%"),
        )
        .limit(5)
        .all()
    )

    folders = (
        db.query(Folder)
        .filter(
            Folder.owner_id == user_id,
            Folder.name.ilike(f"%{q}%"),
        )
        .limit(5)
        .all()
    )

    shares = (
        db.query(ShareLink)
        .join(File, ShareLink.file_id == File.id)
        .filter(
            ShareLink.created_by == user_id,
            File.original_name.ilike(f"%{q}%"),
        )
        .limit(5)
        .all()
    )

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.title.ilike(f"%{q}%"),
        )
        .limit(5)
        .all()
    )

    return {
        "files": files,
        "folders": folders,
        "shares": shares,
        "notifications": notifications,
    }