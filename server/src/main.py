import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.api import api_router
from src.database.core import Base, engine

# =====================================================
# IMPORT MODELS
# =====================================================

# Activity Monitor models
from src.activity_monitor import models  # noqa: F401

# Sharing models
from src.sharing import model  # noqa: F401

# File Management models
from src.todos import models as file_models  # noqa: F401


# =====================================================
# ROUTERS
# =====================================================

from src.sharing.controller import (
    router as sharing_router,
)

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


# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="TrustShare API",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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

    # Create SQLAlchemy tables registered
    # with Base if they do not already exist.
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
# API ROUTERS
# =====================================================

# api_router contains:
# - File Management
# - Activity Monitor
# - Health

app.include_router(
    api_router
)


# Secure Sharing
app.include_router(
    sharing_router
)


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
        "message": "Backend Running"
    }