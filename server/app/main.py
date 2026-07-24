"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
import app.models
from app.routers import auth

# NOTE: for production, prefer Alembic migrations (see /server/alembic) over
# create_all(). This call is kept for fast local setup only.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=f"{settings.APP_NAME} API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
