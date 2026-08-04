import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text

# =====================================================
# DATABASE
# =====================================================

from src.database.core import Base, engine


# =====================================================
# ENTITY / MODEL IMPORTS
# These imports register models with SQLAlchemy Base
# =====================================================

# Admin / Core entities
from src.entities.audit_log import AuditLog  # noqa: F401
from src.entities.issue import Issue  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.user import User  # noqa: F401
from src.entities.system_health import SystemHealth  # noqa: F401

# Activity Monitor models
from src.activity_monitor import models  # noqa: F401

# Secure Sharing models
from src.sharing import model  # noqa: F401

# File Management models
from src.todos import models as file_models  # noqa: F401

# Feature-specific module imports for analytics
from src.analytics.controller import router as analytics_router
from src.analytics import model as analytics_model  # noqa: F401


# =====================================================
# ROUTERS
# =====================================================

# Main API router
# Contains File Management, Activity Monitor, Dashboard and Health
from src.api import api_router

# Admin
from src.admin.routes import router as admin_router

# Secure Sharing
from src.sharing.controller import router as sharing_router

# Notifications
from app.api.v1.notifications.routes import (
    router as notification_router,
)


# =====================================================
# FRONTEND URL
# =====================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)

FRONTEND_URL_ALT = os.getenv("FRONTEND_URL_ALT", "http://localhost:5173")


# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="TrustShare API",
    version="1.0.0",
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        FRONTEND_URL_ALT,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# STARTUP
# =====================================================

@app.on_event("startup")
def on_startup():

    # Create all registered SQLAlchemy tables
    Base.metadata.create_all(
        bind=engine
    )

    # Activity Monitor compatibility columns
    with engine.begin() as conn:

        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS "
                "resource VARCHAR(255)"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS "
                "ip_address VARCHAR(45)"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS "
                "status VARCHAR(30) "
                "NOT NULL DEFAULT 'success'"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS "
                "details TEXT"
            )
        )


# =====================================================
# REGISTER ROUTERS
# =====================================================

# Admin
app.include_router(
    admin_router
)

# Main API:
# - File Management
# - Activity Monitor
# - Dashboard
# - Health
app.include_router(
    api_router
)

# Secure Sharing
app.include_router(
    sharing_router
)

# Analytics
app.include_router(analytics_router)

# Notifications
app.include_router(
    notification_router
)


# =====================================================
# ROOT ENDPOINT
# =====================================================

@app.get("/")
def home():
    return {
        "message": "Secure File Sharing Backend Running"
    }