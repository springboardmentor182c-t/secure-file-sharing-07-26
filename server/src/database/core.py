"""
Database engine + session setup (synchronous SQLAlchemy 2.0, matching this
project's existing dependency set — no async driver is installed).

Every other module imports `get_db` from here for its route dependencies,
and imports `Base` (re-exported from `src.entities.base`) for Alembic.
"""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.entities.base import Base  # re-exported for `from src.database.core import Base`

load_dotenv()

# PostgreSQL is this project's database — every teammate's module targets
# the same Postgres instance. Set DATABASE_URL in .env; the value below is
# only a last-resort default so the app doesn't crash if .env is missing.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://sharedlinks_user:sharedlinks_pass@localhost:5432/sharedlinks_db",
)

# SQLite is supported ONLY as an explicit opt-in (DATABASE_URL=sqlite:///...)
# for quick local experiments without a Postgres install — it is not the
# default and production/team use always means Postgres.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=_connect_args, echo=os.getenv("SQL_ECHO", "false").lower() == "true")

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
    lifespan check in src/main.py). Postgres — i.e. every real run of this
    project — always goes through Alembic migrations instead
    (`alembic upgrade head`), never this function."""
    Base.metadata.create_all(bind=engine)
