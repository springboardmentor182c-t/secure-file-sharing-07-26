from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.files.controller import router as files_router
from src.folders.controller import router as folders_router
from src.shares.controller import router as shares_router
from src.notifications.controller import router as notifications_router
from src.audit.controller import router as audit_router
from src.analytics.controller import router as analytics_router
from src.admin.controller import router as admin_router
from src.todos.controller import router as todos_router
from src.encryption.controller import router as encryption_router
from src.exceptions import AppException, app_exception_handler
from src.database.init_db import init_db


def create_app() -> FastAPI:
    # Initialize DB tables
    init_db()

    app = FastAPI(
        title="SecureShare API",
        version="2.0.0",
        description="Secure File-Sharing System — FastAPI Backend",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000", "http://127.0.0.1:3000",
            "http://localhost:3001", "http://127.0.0.1:3001",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ────────────────────────────────────────────────────
    app.add_exception_handler(AppException, app_exception_handler)

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(files_router,         prefix="/api/files",         tags=["Files"])
    app.include_router(folders_router,       prefix="/api/folders",       tags=["Folders"])
    app.include_router(shares_router,        prefix="/api/shares",        tags=["Sharing"])
    app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])
    app.include_router(audit_router,         prefix="/api/audit",         tags=["Audit"])
    app.include_router(analytics_router,     prefix="/api/analytics",     tags=["Analytics"])
    app.include_router(admin_router,         prefix="/api/admin",         tags=["Admin"])
    app.include_router(todos_router,         prefix="/api/todos",         tags=["Todos"])
    app.include_router(encryption_router,    prefix="/api/encryption",    tags=["Encryption"])

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"])
    def health():
        return {"status": "ok", "service": "SecureShare API", "version": "2.0.0"}

    return app


app = create_app()
