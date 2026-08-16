import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.shared_links.dependencies import get_current_user_id
from src.shared_links.models import ApiResponse
from src.analytics import service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=ApiResponse[dict], summary="Full analytics overview")
def get_overview(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)]
):
    overview = service.get_analytics_overview(db, owner_id)
    return ApiResponse(data=overview.model_dump())


@router.get("/stats", response_model=ApiResponse[dict], summary="Stat summary cards")
def get_stats(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)]
):
    stats = service.get_stats(db, owner_id)
    return ApiResponse(data=stats.model_dump())


@router.get("/monthly-activity", response_model=ApiResponse[list], summary="Monthly activity points")
def get_monthly_activity(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)]
):
    data = service.get_monthly_activity(db, owner_id)
    return ApiResponse(data=[d.model_dump() for d in data])
