from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

# Load variables from a .env file (if present) so DATABASE_URL etc. are available
load_dotenv()

# Default to a local PostgreSQL instance; override via the DATABASE_URL env var.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://trustshare:trustshare@localhost:5432/trustshare",
)

is_sqlite = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,  # transparently recover from dropped Postgres connections
)

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
