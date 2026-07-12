from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.login_history import LoginHistory
from app.models.security_event import SecurityEvent


def get_audit_logs(db: Session):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )


def get_login_history(db: Session):
    return (
        db.query(LoginHistory)
        .order_by(LoginHistory.timestamp.desc())
        .all()
    )


def get_security_events(db: Session):
    return (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.timestamp.desc())
        .all()
    )