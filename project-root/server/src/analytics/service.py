# server/src/analytics/service.py

from sqlalchemy.orm import Session
from src.analytics.repository import AnalyticsRepository


class AnalyticsService:
    def __init__(self):
        self.repo = AnalyticsRepository()

    def get_storage(self, db: Session):
        return self.repo.get_storage_summary(db)

    def get_upload_analytics(self, db: Session, days: int = 30):
        return self.repo.get_upload_analytics(db, days=days)

    def get_download_analytics(self, db: Session, days: int = 30):
        return self.repo.get_download_analytics(db, days=days)

    def get_delete_analytics(self, db: Session):
        return self.repo.get_delete_analytics(db)

    def get_sharing_analytics(self, db: Session):
        return self.repo.get_sharing_analytics(db)

    def get_security_analytics(self, db: Session, days: int = 30):
        return self.repo.get_security_analytics(db, days=days)

    def get_recent_activity(self, db: Session, user_id: int | None = None):
        return self.repo.get_recent_activity(db, user_id=user_id)

    def get_users_list(self, db: Session):
        return self.repo.get_users_list(db)

    def get_system_stats(self, db: Session):
        return self.repo.get_system_stats(db)

    def get_ui_config(self, db: Session):
        return self.repo.get_ui_config(db)

    def get_summary(
        self,
        db: Session,
        days: int = 30,
        user_id: int | None = None,
    ):
        return {
            "storage":         self.repo.get_storage_summary(db),
            "uploads":         self.repo.get_upload_analytics(db, days=days),
            "downloads":       self.repo.get_download_analytics(db, days=days),
            "deletes":         self.repo.get_delete_analytics(db),
            "sharing":         self.repo.get_sharing_analytics(db),
            "security":        self.repo.get_security_analytics(db, days=days),
            "recent_activity": {
                "activities": self.repo.get_recent_activity(db, user_id=user_id)
            },
            "system_stats":    self.repo.get_system_stats(db),
            "ui_config":       self.repo.get_ui_config(db),
        }