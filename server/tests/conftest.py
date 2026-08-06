"""
Shared pytest fixtures.

Tests run against an isolated in-memory SQLite database (never the dev/prod
one) so the suite is fast and side-effect free. Each test gets a fresh
schema via the `db_session` fixture.
"""
import base64
import os
import tempfile

# Files-module env vars must be set BEFORE `src.main`/`src.files.storage`
# are imported below (they're read at import/module-load time), so tests
# never touch the real storage directory and never need a real .env.
os.environ.setdefault("FILES_ENCRYPTION_KEY", base64.urlsafe_b64encode(os.urandom(32)).decode())
os.environ.setdefault("FILES_STORAGE_DIR", tempfile.mkdtemp(prefix="trustshare_test_storage_"))
os.environ.setdefault("SCHEDULER_ENABLED", "false")

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
