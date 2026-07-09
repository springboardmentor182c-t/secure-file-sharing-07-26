import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Fetch database connection string from environment variables, defaulting to a local PostgreSQL instance
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+pg8000://postgres:postgres@localhost:5432/security_dashboard"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
