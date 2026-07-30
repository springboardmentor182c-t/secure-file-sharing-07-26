import uuid

import pytest
from fastapi.testclient import TestClient

from src.api import app
from src.auth.dependencies import create_access_token
from src.database.core import DATABASE_URL, SessionLocal, is_postgresql_url
from src.entities.user import User


pytestmark = pytest.mark.skipif(
    not is_postgresql_url(DATABASE_URL),
    reason="PostgreSQL smoke test requires a PostgreSQL DATABASE_URL",
)


def test_analytics_summary_executes_on_postgresql():
    db = SessionLocal()
    user = User(
        name="PostgreSQL Analytics CI",
        email=f"analytics-ci-{uuid.uuid4().hex}@example.com",
        hashed_password="not-used",
        role="member",
        is_active=True,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id)})
        response = TestClient(app, raise_server_exceptions=False).get(
            "/api/analytics/summary?days=30",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200, response.text
        payload = response.json()
        assert "sharing" in payload
        assert "by_department" in payload["sharing"]
    finally:
        if user.id is not None:
            db.query(User).filter(User.id == user.id).delete()
            db.commit()
        db.close()
