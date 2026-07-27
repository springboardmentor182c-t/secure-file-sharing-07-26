
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth.controller import router as auth_router

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.entities.audit_log import AuditLog
from src.entities.issue import Issue
from src.entities.file import File
from src.entities.user import User
from src.entities.system_health import SystemHealth

from src.admin.routes import router as admin_router

# Core application and database module imports
from src.api import api_router
from src.database.core import Base, engine
from src.activity_monitor import models  # noqa: F401

from src.sharing.controller import router as sharing_router
from src.sharing import model  # noqa: F401

# Retrieve the frontend URL from environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Initialize FastAPI
app = FastAPI(title="TrustShare API", version="1.0.0")

# Configure CORS
from app.api.v1.notifications.routes import router as notification_router


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


app = FastAPI(
    title="TrustShare API",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],

app.add_middleware(
    CORSMiddleware,
<<<<<<< HEAD
    allow_origins=[FRONTEND_URL],

=======
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        FRONTEND_URL,
    ],
>>>>>>> origin/main-group-C
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event

# Register Authentication APIs
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "TrustShare Backend Running Successfully"
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
app.include_router(admin_router)

app.include_router(api_router)
app.include_router(sharing_router)
app.include_router(notification_router)


# Health Check
@app.get("/")
def home():
<<<<<<< HEAD
    return {"message": "Backend Running"}

=======
    return {"message": "Secure File Sharing Backend Running"}
>>>>>>> origin/main-group-C
