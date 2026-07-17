from sqlalchemy.orm import Session

from app.api.v1.dashboard import schemas, service


def read_summary(db: Session) -> schemas.DashboardSummaryResponse:
    return service.get_dashboard_summary(db)


def read_recent_files(db: Session) -> list[schemas.RecentFile]:
    return service.get_recent_files(db)


def read_recent_activity(db: Session) -> list[schemas.RecentActivity]:
    return service.get_recent_activity(db)


def read_notifications(db: Session) -> list[schemas.NotificationPreview]:
    return service.get_notifications(db)


def read_storage(db: Session) -> schemas.DashboardStorage:
    return service.get_storage(db)


def read_security_status(db: Session) -> list[schemas.SecurityStatus]:
    return service.get_security_status(db)


def read_charts(db: Session) -> schemas.DashboardChartsResponse:
    return service.get_charts(db)


def read_team_activity(db: Session) -> list[schemas.TeamActivity]:
    return service.get_team_activity(db)
