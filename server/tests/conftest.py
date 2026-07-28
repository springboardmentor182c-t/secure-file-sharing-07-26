"""
Shared pytest fixtures.

Tests run against an isolated in-memory SQLite database (never the dev/prod
one) so the suite is fast and side-effect free. Each test gets a fresh
schema via the `db_session` fixture.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.database.core import get_db
from src.entities.base import Base
from src.main import app

import src.entities  # noqa: F401

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture
def db_session():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    def _get_db_override():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_db_override
    yield TestingSessionLocal
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def client(db_session):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def owner_id() -> str:
    return "11111111-1111-1111-1111-111111111111"


@pytest.fixture
def auth_headers(owner_id) -> dict:
    return {"X-User-Id": owner_id}
