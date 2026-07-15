import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database.core import engine, Base
from src.api import api_router
from src.exceptions import AppException, app_exception_handler, global_exception_handler
from src.logging import setup_logging
from src.rate_limiter import RateLimiterMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    setup_logging()
    logging.info("FastAPI backend is starting up...")
    yield
    # Shutdown actions
    logging.info("FastAPI backend is shutting down...")

app = FastAPI(
    title="Clean Architecture Todo API",
    description="FastAPI Backend matching clean architecture structure guidelines.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, lock this down to client origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Rate Limiter (60 requests per minute)
app.add_middleware(RateLimiterMiddleware, limit=60, window_seconds=60)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Register consolidated API router under /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Clean Architecture API", "docs": "/docs"}
