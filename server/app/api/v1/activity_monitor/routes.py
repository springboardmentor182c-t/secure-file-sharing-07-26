from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db

from . import controller
from .schemas import (
    AuditLogResponse,
    LoginHistoryResponse,
    SecurityEventResponse,
)

router = APIRouter(
    prefix="/activity-monitor",
    tags=["Activity Monitor"],
)


@router.get(
    "/audit",
    response_model=list[AuditLogResponse],
)
def get_audit_logs(
    db: Session = Depends(get_db),
):
    return controller.fetch_audit_logs(db)


@router.get(
    "/login-history",
    response_model=list[LoginHistoryResponse],
)
def get_login_history(
    db: Session = Depends(get_db),
):
    return controller.fetch_login_history(db)


@router.get(
    "/security-events",
    response_model=list[SecurityEventResponse],
)
def get_security_events(
    db: Session = Depends(get_db),
):
    return controller.fetch_security_events(db)