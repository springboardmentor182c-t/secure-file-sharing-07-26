import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from the .env file
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

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