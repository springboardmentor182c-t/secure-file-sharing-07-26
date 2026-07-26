"""
Database engine + session setup (synchronous SQLAlchemy 2.0, matching this
project's existing dependency set — no async driver is installed).

Every other module imports `get_db` from here for its route dependencies,
and imports `Base` (re-exported from `src.entities.base`) for Alembic.
"""
import os
import pathlib
from typing import Optional

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from src.entities.base import Base  # re-exported for `from src.database.core import Base`


def _find_dotenv() -> Optional[pathlib.Path]:
    """Locate the server-level .env file from the current module path."""
    candidates = [
        pathlib.Path(__file__).resolve().parents[2] / ".env",
        pathlib.Path.cwd() / ".env",
        pathlib.Path(__file__).resolve().parent.parent.parent / ".env",
    ]
    for path in candidates:
        if path.exists():
            return path
    return None


def _get_default_database_url() -> str:
    """Prefer a local SQLite database for development so the app runs without Postgres."""
    server_root = pathlib.Path(__file__).resolve().parents[2]
    sqlite_path = server_root / "storage" / "dev.db"
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{sqlite_path.as_posix()}"


# Load the project's .env file from the server directory explicitly so the
# backend works even when the process is started from the workspace root.
dotenv_path = _find_dotenv()
if dotenv_path is not None:
    load_dotenv(dotenv_path)


def _resolve_database_url() -> str:
    configured_url = os.getenv("DATABASE_URL")
    if configured_url:
        if configured_url.startswith("postgresql"):
            try:
                engine = create_engine(configured_url, echo=False)
                with engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                return configured_url
            except Exception:
                return _get_default_database_url()
        return configured_url

    return _get_default_database_url()


DATABASE_URL = _resolve_database_url()

# SQLite is supported for local development and test runs. Postgres remains
# usable when a reachable server is configured.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency yielding a DB session per request."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables() -> None:
    """Dev convenience only, and only ever used against SQLite (see the
    lifespan check in src/main.py). Postgres � i.e. every real run of this
    project � always goes through Alembic migrations instead
    (`alembic upgrade head`), never this function."""
    Base.metadata.create_all(bind=engine)
