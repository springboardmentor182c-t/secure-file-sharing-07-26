import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()


# =====================================================
# DATABASE CONFIGURATION
# =====================================================

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Prefer DATABASE_URL when provided
DATABASE_URL = os.getenv("DATABASE_URL")


# =====================================================
# FALLBACK DATABASE CONFIGURATION
# =====================================================

# If DATABASE_URL is not provided, construct it
# using the individual database environment variables.

if not DATABASE_URL:

    if not all([
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_USER,
        DB_PASSWORD,
    ]):
        raise RuntimeError(
            "Database configuration is missing. "
            "Set DATABASE_URL or provide "
            "DB_HOST, DB_PORT, DB_NAME, "
            "DB_USER and DB_PASSWORD."
        )

    DATABASE_URL = (
        f"postgresql://"
        f"{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found. Check your .env file.")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =====================================================
# SQLALCHEMY BASE
# =====================================================

Base = declarative_base()


# =====================================================
# DATABASE DEPENDENCY
# =====================================================

def get_db():
    """
    Database session dependency.
    """
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()