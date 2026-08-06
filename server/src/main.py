import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
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


from app.api.v1.notifications.routes import router as notification_router

from src.users.controller import router as user_router

# File Management
from src.todos.controller import router as todos_router

# =====================================================
# ROUTERS
# =====================================================


# Activity Monitor
from src.activity_monitor import models  # noqa: F401


# Entity imports (register tables)
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


# =====================================================
# FRONTEND URL
# =====================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FRONTEND_URL_ALT = os.getenv("FRONTEND_URL_ALT", "http://localhost:5173")


# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="TrustShare API",
    version="1.0.0",
)

# CORS
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



@app.get("/")
def root():
    return {
        "message": "Secure File Sharing Platform API is running"
    }

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


# Register Routers
app.include_router(auth_router)
app.include_router(admin_router)

app.include_router(api_router)

app.include_router(api_router)
app.include_router(sharing_router)
app.include_router(analytics_router)

# Notifications
app.include_router(
    notification_router
)

# File Management
app.include_router(todos_router)

@app.get("/")
def root():
    return {
        "message": "TrustShare Backend Running Successfully"
    }