import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from the .env file
load_dotenv()

# Retrieve the database connection string from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize the database engine instance
engine = create_engine(DATABASE_URL)

# Configure the database session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define the base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    """
    Manage the database session lifecycle, ensuring safe connection closure.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()