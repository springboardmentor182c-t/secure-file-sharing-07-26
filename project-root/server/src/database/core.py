from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# PostgreSQL URL (default: postgresql+psycopg2://secureshare:secureshare@localhost:5432/secureshare)
PG_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://secureshare:secureshare@localhost:5432/secureshare",
)

def _get_engine():
    """Attempt PostgreSQL connection first; fall back to SQLite if PostgreSQL server is not running."""
    if PG_URL.startswith("sqlite"):
        return create_engine(PG_URL, connect_args={"check_same_thread": False})

    try:
        pg_engine = create_engine(PG_URL, pool_pre_ping=True)
        # Test connection
        with pg_engine.connect() as conn:
            pass
        return pg_engine
    except Exception:
        # Fall back to SQLite if PostgreSQL is offline or unreachable
        sqlite_url = "sqlite:///./app.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = _get_engine()
is_sqlite = engine.url.drivername.startswith("sqlite")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency: yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
