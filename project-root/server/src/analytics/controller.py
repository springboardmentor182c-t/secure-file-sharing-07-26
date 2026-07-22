from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.analytics import models, service

router = APIRouter()


@router.get(
    "/summary",
    response_model=models.AnalyticsSummaryResponse,
    summary="Analytics dashboard summary",
    description=(
        "Returns stat cards, file activity bar-chart data, security events "
        "(last 7 days), top users by audit-log actions, and system health "
        "for the requested time range."
    ),
)
def get_analytics_summary(
    range: str = Query("7d", regex="^(7d|30d|90d)$", description="Time range: 7d | 30d | 90d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_summary(db=db, range_key=range)
