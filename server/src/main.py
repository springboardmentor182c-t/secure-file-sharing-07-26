import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.admin.routes import router as admin_router
from src.api import api_router
from src.database.core import Base, engine
from src.sharing.controller import router as sharing_router
from src.upload.controller import router as upload_router
from src.analytics.controller import router as analytics_router
from src.security.controller import router as security_router
from app.api.v1.notifications.routes import router as notification_router

# Import models so SQLAlchemy creates tables
from src.activity_monitor import models  # noqa: F401
from src.sharing import model  # noqa: F401
from src.analytics import model as analytics_model  # noqa: F401
from src.entities.audit_log import AuditLog  # noqa: F401
from src.entities.issue import Issue  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.user import User  # noqa: F401
from src.entities.system_health import SystemHealth  # noqa: F401

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FRONTEND_URL_ALT = os.getenv("FRONTEND_URL_ALT", "http://localhost:5173")

app = FastAPI(
    title="TrustShare API",
    version="1.0.0",
)

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


@app.get("/")
def home():
    return {
        "message": "Secure File Sharing Backend Running"
    }


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


# Register Routers
app.include_router(api_router)
app.include_router(admin_router)
app.include_router(sharing_router)
app.include_router(upload_router)
app.include_router(analytics_router)
app.include_router(notification_router)
app.include_router(security_router)