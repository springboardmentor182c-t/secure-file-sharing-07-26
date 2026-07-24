import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.api import api_router
from src.database.core import Base, engine
from src.activity_monitor import models  # noqa: F401

from src.sharing.controller import router as sharing_router
from src.sharing import model  # noqa: F401

from app.api.v1.notifications.routes import router as notification_router


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(
    title="TrustShare API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


app.include_router(api_router)
app.include_router(sharing_router)
app.include_router(notification_router)


@app.get("/")
def home():
    return {"message": "Backend Running"}