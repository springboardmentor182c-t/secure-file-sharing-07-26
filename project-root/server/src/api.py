from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.files.controller import router as files_router
from src.folders.controller import router as folders_router
from src.exceptions import AppException, app_exception_handler
from src.database.init_db import init_db


def create_app() -> FastAPI:
    # Initialize DB tables
    init_db()

    app = FastAPI(
        title="MyFiles API",
        version="1.0.0",
        description="Secure File Storage — My Files Backend",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ────────────────────────────────────────────────────
    app.add_exception_handler(AppException, app_exception_handler)

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(files_router,   prefix="/api/files",   tags=["Files"])
    app.include_router(folders_router, prefix="/api/folders", tags=["Folders"])

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"])
    def health():
        return {"status": "ok", "service": "MyFiles API", "version": "1.0.0"}

    return app


app = create_app()
