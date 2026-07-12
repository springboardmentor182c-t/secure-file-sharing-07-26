from sqlalchemy.orm import Session

from . import service


def fetch_audit_logs(db: Session):
    return service.get_audit_logs(db)


def fetch_login_history(db: Session):
    return service.get_login_history(db)


def fetch_security_events(db: Session):
    return service.get_security_events(db)