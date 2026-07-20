from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.entities.audit_log import AuditLog
from src.entities.issue import Issue
from src.entities.file import File
from src.entities.user import User

from src.admin.routes import router as admin_router
from src.api import api_router
from src.database.core import Base, engine
from src.activity_monitor import models  # noqa: F401

app = FastAPI(title="Secure File Sharing")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS resource VARCHAR(255)"
        ))
        conn.execute(text(
            "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)"
        ))
        conn.execute(text(
            "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'success'"
        ))
        conn.execute(text(
            "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS details TEXT"
        ))


app.include_router(admin_router)
app.include_router(api_router)


@app.get("/")
def home():
    return {"message": "Secure File Sharing Backend Running"}