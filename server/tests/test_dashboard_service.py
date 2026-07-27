# test_dashboard_service.py
from unittest.mock import MagicMock, patch
import pytest

from src.dashboard import service, models


class TestDashboardService:

    # Test 1: get_dashboard_stats should return correct DashboardStats shape
    def test_get_dashboard_stats_returns_correct_data(self):
        mock_db = MagicMock()

        # db.query(User).count() -> total_users
        # db.query(User).filter(...).count() -> active_users
        mock_db.query.return_value.count.return_value = 5
        mock_db.query.return_value.filter.return_value.count.return_value = 3

        # db.query(func.coalesce(...)).scalar() -> total_storage_bytes
        mock_db.query.return_value.scalar.return_value = 2_000_000_000  # 2 GB

        # db.query(File).filter(...).count() -> files_this_month
        # (already covered by the filter().count() mock above, reused)

        # db.query(SharedLink).filter(...).count() -> active_share_links
        # (also reused since it's the same mock chain)

        result = service.get_dashboard_stats(mock_db)

        assert isinstance(result, models.DashboardStats)
        assert result.total_users == 5
        assert result.total_storage_limit_gb == service.STORAGE_LIMIT_GB

    # Test 2: invite_user should raise ValueError if email already exists
    def test_invite_user_raises_error_for_duplicate_email(self):
        mock_db = MagicMock()

        # simulate an existing user found with this email
        mock_db.query.return_value.filter.return_value.first.return_value = MagicMock()

        payload = models.InviteUserRequest(
            name="John Doe",
            email="john@example.com",
            role="Viewer"
        )

        with pytest.raises(ValueError, match="A user with this email already exists"):
            service.invite_user(mock_db, payload)