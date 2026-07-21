
"""
Database engine + session setup (synchronous SQLAlchemy 2.0, matching this
project's existing dependency set — no async driver is installed).

Every other module imports `get_db` from here for its route dependencies,
and imports `Base` (re-exported from `src.entities.base`) for Alembic.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.entities.base import Base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")



_connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:

        db.close()


def create_all_tables() -> None:
    """Create all tables (used only for SQLite development)."""
    Base.metadata.create_all(bind=engine)
