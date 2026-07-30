from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text
import os

from src.api import api_router
from src.database.core import Base, engine

load_dotenv()

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

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Secure File Sharing Platform API is running"
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