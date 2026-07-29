import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.shared_links.dependencies import get_current_user_id
from src.shared_links.models import ApiResponse
from src.analytics import service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", summary="Full analytics overview")
def get_overview(db: Annotated[Session, Depends(get_db)]):
    dummy_owner_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    try:
        overview = service.get_analytics_overview(db, dummy_owner_id)
        return ApiResponse(data=overview.model_dump())
    except Exception:
        return ApiResponse(data={
            "stats": {
                "active_links": 0, "expiring_soon_links": 0, "total_views": 0,
                "total_downloads": 0, "view_to_download_ratio": 0.0, "total_storage_bytes": 0
            },
            "monthly_activity": [],
            "top_files": []
        })


@router.get("/stats", summary="Stat summary cards")
def get_stats(db: Annotated[Session, Depends(get_db)]):
    dummy_owner_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    try:
        stats = service.get_stats(db, dummy_owner_id)
        return ApiResponse(data=stats.model_dump())
    except Exception:
        return ApiResponse(data={
            "active_links": 0, "expiring_soon_links": 0, "total_views": 0,
            "total_downloads": 0, "view_to_download_ratio": 0.0, "total_storage_bytes": 0
        })


@router.get("/monthly-activity", summary="Monthly activity points")
def get_monthly_activity(db: Annotated[Session, Depends(get_db)]):
    dummy_owner_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
    try:
        data = service.get_monthly_activity(db, dummy_owner_id)
        return ApiResponse(data=[d.model_dump() for d in data])
    except Exception:
        return ApiResponse(data=[])
