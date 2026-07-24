# server/src/analytics/service.py

from sqlalchemy.orm import Session
from src.analytics.repository import AnalyticsRepository


class AnalyticsService:
    def __init__(self):
        self.repo = AnalyticsRepository()

    def get_storage(self, db: Session, days: int = 30):
        return self.repo.get_storage_summary(db, days=days)

    def get_upload_analytics(self, db: Session, days: int = 30):
        return self.repo.get_upload_analytics(db, days=days)

    def get_download_analytics(self, db: Session, days: int = 30):
        return self.repo.get_download_analytics(db, days=days)

    def get_delete_analytics(self, db: Session, days: int = 30):
        return self.repo.get_delete_analytics(db, days=days)

    def get_sharing_analytics(self, db: Session, days: int = 30):
        return self.repo.get_sharing_analytics(db, days=days)

    def get_security_analytics(self, db: Session, days: int = 30):
        return self.repo.get_security_analytics(db, days=days)

    def get_recent_activity(
        self, db: Session, user_id: int | None = None, days: int = 30
    ):
        return self.repo.get_recent_activity(db, user_id=user_id, days=days)

    def get_users_list(self, db: Session):
        return self.repo.get_users_list(db)

    def get_system_stats(self, db: Session):
        return self.repo.get_system_stats(db)

    def get_ui_config(self, db: Session):
        return self.repo.get_ui_config(db)

    def get_trend_indicators(self, db: Session):
        return self.repo.get_trend_indicators(db)

    def get_csv_export_data(self, db: Session, days: int = 30):
        return self.repo.get_csv_export_data(db, days=days)

    def get_file_type_distribution(self, db: Session, days: int = 30):
        """File type breakdown for pie chart (within date range)."""
        return self.repo.get_file_type_distribution(db, days=days)

    def get_top_active_users(self, db: Session, days: int = 30, limit: int = 5):
        """Most active users ranked by activity."""
        return self.repo.get_top_active_users(db, days=days, limit=limit)

    def get_security_score(self, db: Session, days: int = 30):
        """Overall security score (0-100)."""
        return self.repo.get_security_score(db, days=days)

    def get_failed_login_heatmap(self, db: Session, days: int = 7):
        """Failed logins heatmap by hour and day."""
        return self.repo.get_failed_login_heatmap(db, days=days)

    def get_mfa_adoption(self, db: Session):
        """MFA adoption statistics."""
        return self.repo.get_mfa_adoption(db)

    def get_summary(
        self,
        db: Session,
        days: int = 30,
        user_id: int | None = None,
    ):
        return {
            "storage": self.repo.get_storage_summary(db, days=days),
            "uploads": self.repo.get_upload_analytics(db, days=days),
            "downloads": self.repo.get_download_analytics(db, days=days),
            "deletes": self.repo.get_delete_analytics(db, days=days),
            "sharing": self.repo.get_sharing_analytics(db, days=days),
            "security": self.repo.get_security_analytics(db, days=days),
            "recent_activity": {
                "activities": self.repo.get_recent_activity(
                    db, user_id=user_id, days=days
                )
            },
            "system_stats": self.repo.get_system_stats(db),
            "trends": self.repo.get_trend_indicators(db),
            "ui_config": self.repo.get_ui_config(db),
            "file_types": self.repo.get_file_type_distribution(db, days=days),
            "top_active_users": self.repo.get_top_active_users(db, days=days),
            "security_score": self.repo.get_security_score(db, days=days),
            "failed_login_heatmap": self.repo.get_failed_login_heatmap(
                db, days=min(days, 30)
            ),
            "mfa_adoption": self.repo.get_mfa_adoption(db),
            "performance_metrics": self.repo.get_performance_metrics(db, days=days),
        }

    def get_performance_metrics(self, db: Session, days: int = 30):
        """Performance metrics per PRD (concurrent handling + processing speed)."""
        return self.repo.get_performance_metrics(db, days=days)
