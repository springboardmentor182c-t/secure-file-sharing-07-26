import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

# Core application and database module imports
from src.api import api_router
from src.database.core import Base, engine
from src.activity_monitor import models  # noqa: F401

# Feature-specific module imports for secure sharing
from src.sharing.controller import router as sharing_router
from src.sharing import model  # noqa: F401

# Retrieve the frontend URL from environment variables (defaults to local development server)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Initialize the FastAPI application instance
app = FastAPI(title="TrustShare API", version="1.0.0")

# Configure Cross-Origin Resource Sharing (CORS) policies dynamically
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application startup event handler for database initialization and schema migrations
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        conn.execute(
            text("ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS resource VARCHAR(255)")
        )
        conn.execute(
            text("ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)")
        )
        conn.execute(
            text("ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'success'")
        )
        conn.execute(
            text("ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS details TEXT")
        )

# Register application routers for distinct modules
app.include_router(api_router)
app.include_router(sharing_router)

# Base health check endpoint
@app.get("/")
def home():
    return {"message": "Backend Running"}
