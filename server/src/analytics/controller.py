import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.shared_links.dependencies import get_current_user_id
from src.shared_links.models import ApiResponse
from src.analytics import service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", summary="Full analytics overview")
def get_overview(db: Annotated[Session, Depends(get_db)]):
    try:
        count_res = db.execute(text("SELECT count(*) FROM shared_links")).fetchone()
        active_count = count_res[0] if count_res else 0

        rows = db.execute(text("SELECT id, file_id, recipient_email, views, downloads, created_at FROM shared_links ORDER BY id DESC LIMIT 5")).fetchall()
        top_files = [
            {
                "id": str(r[0]),
                "file_name": "kibi.jpg",
                "total_views": r[3] or 0,
                "total_downloads": r[4] or 0,
                "created_at": str(r[5] or "")
            }
            for r in rows
        ]

        recent_activity = [
            {
                "id": str(r[0]),
                "file_name": "kibi.jpg",
                "action": "view",
                "user_email": r[2] or "nk91042020@gmail.com",
                "timestamp": str(r[5] or "")
            }
            for r in rows
        ]

        return ApiResponse(data={
            "stats": {
                "active_links": active_count,
                "expiring_soon_links": 0,
                "total_views": sum(r[3] or 0 for r in rows),
                "total_downloads": sum(r[4] or 0 for r in rows),
                "view_to_download_ratio": 0.0,
                "total_storage_bytes": 1048576 * active_count
            },
            "monthly_activity": [{"label": "Jul", "created": active_count, "access_events": 0}],
            "top_files": top_files,
            "recent_activity": recent_activity
        })
    except Exception:
        return ApiResponse(data={
            "stats": {
                "active_links": 0, "expiring_soon_links": 0, "total_views": 0,
                "total_downloads": 0, "view_to_download_ratio": 0.0, "total_storage_bytes": 0
            },
            "monthly_activity": [],
            "top_files": [],
            "recent_activity": []
        })


@router.get("/stats", summary="Stat summary cards")
def get_stats(db: Annotated[Session, Depends(get_db)]):
    try:
        count_res = db.execute(text("SELECT count(*) FROM shared_links")).fetchone()
        active_count = count_res[0] if count_res else 0
        return ApiResponse(data={
            "active_links": active_count,
            "expiring_soon_links": 0,
            "total_views": 0,
            "total_downloads": 0,
            "view_to_download_ratio": 0.0,
            "total_storage_bytes": 1048576 * active_count
        })
    except Exception:
        return ApiResponse(data={
            "active_links": 0, "expiring_soon_links": 0, "total_views": 0,
            "total_downloads": 0, "view_to_download_ratio": 0.0, "total_storage_bytes": 0
        })


@router.get("/monthly-activity", summary="Monthly activity points")
def get_monthly_activity(db: Annotated[Session, Depends(get_db)]):
    try:
        rows = db.execute(text("""
            SELECT 
                TO_CHAR(created_at, 'Mon') AS month_name,
                COUNT(*) AS created_count,
                COALESCE(SUM(views + downloads), 0) AS access_events,
                TO_CHAR(created_at, 'YYYY-MM') AS sort_key
            FROM shared_links
            GROUP BY month_name, sort_key
            ORDER BY sort_key ASC
        """)).fetchall()

        if not rows:
            current_month = datetime.utcnow().strftime("%b")
            return ApiResponse(data=[{"label": current_month, "created": 0, "access_events": 0}])

        data = [
            {"label": r[0], "created": r[1], "access_events": r[2]}
            for r in rows
        ]
        return ApiResponse(data=data)
    except Exception:
        current_month = datetime.utcnow().strftime("%b")
        return ApiResponse(data=[{"label": current_month, "created": 0, "access_events": 0}])
