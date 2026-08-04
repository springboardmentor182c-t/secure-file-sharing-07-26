import os

# Run tests against an isolated PostgreSQL database — must be set before importing
# app modules, since src.database.core reads DATABASE_URL at import time.
# Override via TEST_DATABASE_URL to point at your own test database if needed.
TEST_DB_URL = os.getenv(
    "TEST_DATABASE_URL",
    "sqlite:///./test_secureshare.db",
)
os.environ["DATABASE_URL"] = TEST_DB_URL

import pytest
from src.api import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.core import Base, get_db

is_sqlite = TEST_DB_URL.startswith("sqlite")
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope='session', autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db):
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
