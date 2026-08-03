import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.database.core import Base, engine

# Authentication
from src.auth.controller import router as auth_router

# Admin
from src.admin.routes import router as admin_router

# API
from src.api import api_router

# Sharing
from src.sharing.controller import router as sharing_router
from src.sharing import model  # noqa: F401

# Notifications
from app.api.v1.notifications.routes import router as notification_router

# Activity Monitor
from src.activity_monitor import models  # noqa: F401

# Entity imports (register tables)
from src.entities.audit_log import AuditLog  # noqa: F401
from src.entities.issue import Issue  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.user import User  # noqa: F401
from src.entities.system_health import SystemHealth  # noqa: F401

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(
    title="TrustShare API",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS resource VARCHAR(255)"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'success'"
            )
        )
        conn.execute(
            text(
                "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS details TEXT"
            )
        )


# Register routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(api_router)
app.include_router(sharing_router)
app.include_router(notification_router)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "TrustShare Backend Running Successfully"
    }