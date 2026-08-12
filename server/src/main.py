import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

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

# File Management
from src.todos.controller import router as todos_router

# Activity Monitor
from src.activity_monitor import models  # noqa: F401

# Entity imports - register tables
from src.entities.audit_log import AuditLog  # noqa: F401
from src.entities.issue import Issue  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.user import User  # noqa: F401
from src.entities.system_health import SystemHealth  # noqa: F401
from src.entities.role import Role  # noqa: F401
from src.entities.user_profile import UserProfile  # noqa: F401
from src.entities.email_verification import EmailVerificationToken  # noqa: F401
from src.entities.mfa import MFACode  # noqa: F401
from src.entities.session import UserSession  # noqa: F401
from src.entities.password_reset import PasswordResetToken  # noqa: F401

# Load environment variables
load_dotenv()

# Frontend URL
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)

# FastAPI application
app = FastAPI(
    title="TrustShare API",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
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

    # Create all registered SQLAlchemy tables
    Base.metadata.create_all(
        bind=engine
    )

    # Activity Monitor compatibility columns
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

    # Create default roles if they don't exist
    with Session(engine) as db:

        admin_role = (
            db.query(Role)
            .filter(Role.role_name == "admin")
            .first()
        )

        user_role = (
            db.query(Role)
            .filter(Role.role_name == "user")
            .first()
        )

        if not admin_role:
            admin_role = Role(
                role_name="admin",
                description="Administrator with full access"
            )
            db.add(admin_role)

        if not user_role:
            user_role = Role(
                role_name="user",
                description="Standard user with limited access"
            )
            db.add(user_role)

        db.commit()

    # Add missing columns to users table
    with engine.begin() as conn:

        conn.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS name VARCHAR(100)"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS storage_used "
                "VARCHAR(20) DEFAULT '0 GB'"
            )
        )

        conn.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS status "
                "VARCHAR(20) DEFAULT 'Active'"
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
# app.include_router(user_router)

# File Management
app.include_router(todos_router)