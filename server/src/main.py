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

from src.api import register_routes
from src.core import ALLOWED_ORIGINS
from src.database.core import DATABASE_URL, create_all_tables
from src.exceptions import register_exception_handlers
from src.files.scheduler import start_scheduler as start_files_scheduler, stop_scheduler as stop_files_scheduler
from src.app_logging import configure_logging
from src.shared_links.scheduler import start_scheduler, stop_scheduler

import src.entities  # noqa: F401

logger = logging.getLogger(__name__)
configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        if DATABASE_URL.startswith("sqlite"):
            create_all_tables()
            logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not automatically create tables: {e}")

    start_scheduler()
    start_files_scheduler()
    logger.info("Secure File Sharing System backend starting up")
    yield
    stop_scheduler()
    stop_files_scheduler()
    logger.info("Secure File Sharing System backend shutting down")


app = FastAPI(
    title="Secure File Sharing System API",
    description="Backend API.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
register_routes(app)


@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Secure File Sharing System API"}
