from typing import List
from sqlalchemy import text
from sqlalchemy.orm import Session
from src.recent.models import RecentFileResponse
from src.entities.file import File


def get_recent_files(db: Session, limit: int = 20) -> List[RecentFileResponse]:
    response = []
    seen_ids = set()

    # Determine primary user email from database
    default_email = "admin@trustshare.com"
    try:
        u_row = db.execute(text("SELECT email, name FROM users ORDER BY id ASC LIMIT 1")).fetchone()
        if u_row and u_row[0]:
            default_email = u_row[0]
    except Exception:
        pass

    # 1. Query uploaded files from files table
    try:
        files = db.query(File).filter((File.is_deleted == False) | (File.is_deleted.is_(None))).order_by(File.id.desc()).limit(limit).all()
        for f in files:
            f_id = str(f.id)
            seen_ids.add(f_id)
            f_name = f.name or f"Document #{f.id}"
            ext = f_name.split(".")[-1].lower() if "." in f_name else (f.file_type or "pdf")
            mime = f"image/{ext}" if ext in ["jpg", "jpeg", "png", "webp"] else f"application/{ext}"
            
            response.append(RecentFileResponse(
                id=f_id,
                file_name=f_name,
                file_size=f.size or "1.2 MB",
                mime_type=mime,
                category_name=f.category or "Uploaded File",
                access_type="viewed",
                accessed_at=str(f.updated_at or f.created_at or "Recently"),
                user_id="1",
                username=default_email
            ))
    except Exception as e:
        print("[RECENT FILES QUERY ERROR]:", e)
        db.rollback()

    # 2. Query shared link activity events
    try:
        rows = db.execute(text("SELECT id, file_id, recipient_email, permission, status, views, downloads, created_at FROM shared_links ORDER BY id DESC LIMIT :limit"), {"limit": limit}).fetchall()
        for r in rows:
            link_id_str = f"link-{r[0]}"
            if link_id_str in seen_ids:
                continue
            
            f_id = r[1]
            file_name = None
            if f_id:
                if str(f_id).isdigit():
                    file_obj = db.get(File, int(f_id))
                    if file_obj:
                        file_name = file_obj.name
                if not file_name:
                    file_obj = db.query(File).filter(File.name == str(f_id)).first()
                    if file_obj:
                        file_name = file_obj.name

            if not file_name:
                file_name = str(f_id) if (f_id and "." in str(f_id)) else f"Shared Document #{r[0]}"

            ext = file_name.split(".")[-1].lower() if "." in file_name else "pdf"
            mime = f"image/{ext}" if ext in ["jpg", "jpeg", "png", "webp"] else f"application/{ext}"
            created_str = r[7].strftime("%Y-%m-%d %H:%M") if hasattr(r[7], 'strftime') else str(r[7] or "Recently")
            recip_user = str(r[2]) if (r[2] and str(r[2]).strip()) else default_email

            response.append(RecentFileResponse(
                id=link_id_str,
                file_name=file_name,
                file_size="1.5 MB",
                mime_type=mime,
                category_name="Shared Link",
                access_type="viewed" if (r[5] or 0) > 0 else "shared",
                accessed_at=created_str,
                user_id="1",
                username=recip_user
            ))
    except Exception as e:
        print("[RECENT LINKS QUERY ERROR]:", e)
        db.rollback()

    return response
