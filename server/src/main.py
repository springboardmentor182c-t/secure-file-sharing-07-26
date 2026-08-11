import os

from dotenv import load_dotenv
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

# Analytics
from src.analytics.controller import router as analytics_router
from src.analytics import model as analytics_model  # noqa: F401

# Notifications
from app.api.v1.notifications.routes import router as notification_router

# Users
from src.users.controller import router as user_router

# Activity Monitor
from src.activity_monitor import models  # noqa: F401

# Entity imports - register tables
from src.entities.audit_log import AuditLog  # noqa: F401
from src.entities.issue import Issue  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.user import User  # noqa: F401
from src.entities.system_health import SystemHealth  # noqa: F401


# Load environment variables
load_dotenv()


# Configure CORS
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)

FRONTEND_URL_ALT = os.getenv(
    "FRONTEND_URL_ALT",
    "http://localhost:5173"
)


app = FastAPI(
    title="TrustShare API",
    version="1.0.0",
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        FRONTEND_URL_ALT,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Home endpoint
@app.get("/")
def root():
    return {
        "message": "TrustShare Backend Running Successfully"
    }


# Startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS resource VARCHAR(255)"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS status "
                "VARCHAR(30) NOT NULL DEFAULT 'success'"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE activity_logs "
                "ADD COLUMN IF NOT EXISTS details TEXT"
            )
        )


# Register routers

# Authentication
app.include_router(auth_router)

# Admin
app.include_router(admin_router)

# Main API
app.include_router(api_router)

# Secure Sharing
app.include_router(sharing_router)

# Analytics
app.include_router(analytics_router)

# Notifications
app.include_router(notification_router)

# Users
app.include_router(user_router)