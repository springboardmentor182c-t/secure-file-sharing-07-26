from sqlalchemy.exc import OperationalError

from src.analytics.controller import service
from src.auth.dependencies import get_current_user
from src.entities.user import User


def test_analytics_database_errors_return_structured_503(client, monkeypatch):
    current_user = User(
        id=901,
        name="Analytics Test",
        email="analytics-error@example.com",
        hashed_password="unused",
        role="member",
        is_active=True,
    )
    client.app.dependency_overrides[get_current_user] = lambda: current_user

    def fail_summary(*args, **kwargs):
        raise OperationalError("SELECT split_part(...)", {}, Exception("boom"))

    monkeypatch.setattr(service, "get_summary", fail_summary)

    response = client.get("/api/analytics/summary?days=30")

    assert response.status_code == 503
    assert response.json() == {
        "detail": (
            "Analytics is temporarily unavailable because its PostgreSQL "
            "database is not configured correctly or cannot be reached."
        ),
        "code": "ANALYTICS_DATABASE_UNAVAILABLE",
    }
    assert "split_part" not in response.text
