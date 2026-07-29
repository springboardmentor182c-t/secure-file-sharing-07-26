# server/src/analytics/service.py

from sqlalchemy.orm import Session
from src.analytics.repository import AnalyticsRepository


class AnalyticsService:
    def __init__(self):
        self.repo = AnalyticsRepository()

    def get_storage(self, db, days=30, user_id=None):
        return self.repo.get_storage_summary(db, days=days, user_id=user_id)

    def get_upload_analytics(self, db: Session, days: int = 30, user_id: int | None = None):
        return self.repo.get_upload_analytics(db, days=days, user_id=user_id)

    def get_download_analytics(self, db: Session, days: int = 30, user_id: int | None = None):
        return self.repo.get_download_analytics(db, days=days, user_id=user_id)

    def get_delete_analytics(self, db: Session, days: int = 30, user_id: int | None = None):
        return self.repo.get_delete_analytics(db, days=days, user_id=user_id)

    def get_sharing_analytics(self, db: Session, days: int = 30, user_id: int | None = None):
        return self.repo.get_sharing_analytics(db, days=days, user_id=user_id)

    def get_security_analytics(self, db: Session, days: int = 30, user_id: int | None = None):
        return self.repo.get_security_analytics(db, days=days, user_id=user_id)

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

    def get_summary(self, db, days=30, user_id=None):
        is_member = user_id is not None
        return {
            # FIX: Storage scoped to member
            "storage": self.repo.get_storage_summary(db, days=days, user_id=user_id),
            "uploads":   self.repo.get_upload_analytics(db, days=days, user_id=user_id),
            "downloads": self.repo.get_download_analytics(db, days=days, user_id=user_id),
            "deletes":   self.repo.get_delete_analytics(db, days=days, user_id=user_id),
            "sharing":   self.repo.get_sharing_analytics(db, days=days, user_id=user_id),
            "security":  self.repo.get_security_analytics(db, days=days, user_id=user_id),
            "recent_activity": {
                "activities": self.repo.get_recent_activity(db, user_id=user_id, days=days)
            },
            "system_stats": self.repo.get_system_stats(db),
            # FIX: Trends scoped to member
            "trends":    self.repo.get_trend_indicators(db, user_id=user_id),
            "ui_config": self.repo.get_ui_config(db),
            "file_types": self.repo.get_file_type_distribution(db, days=days, user_id=user_id),
            # Leaderboard stays global
            "top_active_users": self.repo.get_top_active_users(db, days=days),
            "security_score": self.repo.get_security_score(db, days=days, user_id=user_id),
            "failed_login_heatmap": self.repo.get_failed_login_heatmap(db, days=min(days, 30), user_id=user_id),
            "mfa_adoption": self.repo.get_mfa_adoption(db, user_id=user_id),
            # FIX: Performance hidden from members
            "performance_metrics": (
                {
                    "active_now": 0, "peak_concurrent_users": 0,
                    "peak_hour": None, "peak_hour_events": 0,
                    "concurrent_uploads": 0, "concurrent_downloads": 0,
                    "concurrent_shares": 0, "files_processed": 0,
                    "avg_file_size_mb": 0, "max_file_size_mb": 0,
                    "total_processed_mb": 0, "estimated_processing_time_s": 0,
                    "avg_processing_time_ms": 0, "db_response_ms": 0,
                    "api_status": "N/A", "api_color": "#6B7280",
                    "events_per_minute": 0, "events_last_hour": 0,
                    "hourly_activity": [],
                }
                if is_member
                else self.repo.get_performance_metrics(db, days=days)
            ),
        }

    def get_performance_metrics(self, db: Session, days: int = 30):
        """Performance metrics per PRD (concurrent handling + processing speed)."""
        return self.repo.get_performance_metrics(db, days=days)
