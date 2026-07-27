from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.analytics import models, service

router = APIRouter()


@router.get("/summary", response_model=models.AnalyticsSummary)
def summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full analytics summary for the authenticated user."""
    return service.build_summary(db, current_user)
