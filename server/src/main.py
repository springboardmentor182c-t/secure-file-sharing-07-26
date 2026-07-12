from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.entities.audit_log import AuditLog
from src.entities.issue import Issue
from src.entities.file import File
from src.entities.user import User

from src.admin.routes import router as admin_router
from src.database.core import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

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

app.include_router(admin_router)

@app.get("/")
def home():
    return {"message": "Secure File Sharing Backend Running"}