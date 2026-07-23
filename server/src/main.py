"""
Application entrypoint.

Run with:
    uvicorn src.main:app --reload
"""

from dotenv import load_dotenv
load_dotenv()

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.exceptions import register_exception_handlers
from src.logging import configure_logging
from src.shared_links.scheduler import start_scheduler, stop_scheduler

from .api import register_routes
from .core import APP_NAME, ALLOWED_ORIGINS
from .database.core import Base, engine, DATABASE_URL, create_all_tables
import src.entities  # noqa: F401
Base.metadata.create_all(bind=engine)


logger = logging.getLogger(__name__)



@asynccontextmanager
async def lifespan(app: FastAPI):
    if DATABASE_URL.startswith("sqlite"):
        create_all_tables()
        logger.info("SQLite dev database ready")

    start_scheduler()
    logger.info("Secure File Sharing System backend starting up")

    yield
    stop_scheduler()
    logger.info("Secure File Sharing System backend shutting down")


app = FastAPI(
    title="Secure File Sharing System API",
    description="Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

_cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)


@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Secure File Sharing System API",
    }
