from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.api import api_router
from src.database.core import Base, engine
from src.activity_monitor import models  # noqa: F401

app = FastAPI(title="Secure File Sharing")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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


app.include_router(api_router)


@app.get("/")
def home():
    return {"message": "Backend Running"}