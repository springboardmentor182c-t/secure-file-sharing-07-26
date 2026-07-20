import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Environment variables configuration
load_dotenv()

# Database connection string mapping
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Database engine instance
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Database session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    """
    Database session lifecycle management.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()