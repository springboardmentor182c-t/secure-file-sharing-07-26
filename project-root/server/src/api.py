from dotenv import load_dotenv
load_dotenv()

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

from src.activity.controller import router as activity_router
from src.admin.controller import router as admin_router
from src.analytics.controller import router as analytics_router
from src.audit.controller import router as audit_router
from src.auth.controller import router as auth_router
from src.dashboard.controller import router as dashboard_router
from src.database.init_db import init_db
from src.exceptions import AppException, app_exception_handler
from src.files.controller import router as files_router
from src.folders.controller import router as folders_router
from src.notifications.controller import router as notifications_router
from src.search.controller import router as search_router
from src.settings.controller import router as settings_router
from src.shared_with_me.controller import router as shared_with_me_router
from src.shares.controller import router as shares_router
from src.todos.controller import router as todos_router
from src.users.controller import router as users_router
from src.security.controller import router as security_router
from src.file_summaries.controller import router as file_summaries_router

from src.assistant.controller import router as assistant_router
from src.assistant.admin_controller import router as assistant_admin_router

class HealthCheckAwareHTTPSRedirectMiddleware(HTTPSRedirectMiddleware):
    """Keep the internal load-balancer health probe on HTTP in production."""

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope["path"] == "/health":
            await self.app(scope, receive, send)
            return
        await super().__call__(scope, receive, send)


def create_app() -> FastAPI:
    # Initialize DB tables
    init_db()

    app = FastAPI(
        title="TrustShare API",
        version="2.0.0",
        description="Secure File-Sharing System — FastAPI Backend",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── HTTPS Redirect Middleware (production only) ────────────────────────────
    # PSD 4.ii: HTTPS/TLS Communication
    # In production (ENVIRONMENT=production), all HTTP requests are
    # automatically redirected to HTTPS.
    # In development, HTTP is allowed (localhost does not need TLS).
    _env = os.getenv("ENVIRONMENT", "development").lower().strip()
    # API Gateway terminates public TLS before forwarding to the protected ECS
    # service through an HTTP ALB. Redirecting inside ECS would otherwise send
    # users to the private ALB hostname instead of the public gateway URL.
    _behind_api_gateway = bool(os.getenv("ECS_CONTAINER_METADATA_URI_V4"))
    if _env in ("production", "prod") and not _behind_api_gateway:
        app.add_middleware(HealthCheckAwareHTTPSRedirectMiddleware)

    configured_origins = os.getenv("BACKEND_CORS_ORIGINS", "")
    origins = [origin.strip().rstrip("/") for origin in configured_origins.split(",") if origin.strip()]
    if not origins:
        origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ────────────────────────────────────────────────────
    app.add_exception_handler(AppException, app_exception_handler)

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(auth_router,           prefix="/api/auth",           tags=["Auth"])
    app.include_router(users_router,          prefix="/api/users",          tags=["Users"])
    app.include_router(files_router,          prefix="/api/files",          tags=["Files"])
    app.include_router(file_summaries_router, prefix="/api/files",          tags=["File summaries"])
    app.include_router(folders_router,        prefix="/api/folders",        tags=["Folders"])
    app.include_router(shares_router,         prefix="/api/shares",         tags=["Sharing"])
    app.include_router(notifications_router,  prefix="/api/notifications",  tags=["Notifications"])
    app.include_router(audit_router,          prefix="/api/audit",          tags=["Audit"])
    app.include_router(analytics_router,      prefix="/api/analytics",      tags=["Analytics"])
    app.include_router(dashboard_router,      prefix="/api/dashboard",      tags=["Dashboard"])
    app.include_router(shared_with_me_router, prefix="/api/shared-with-me", tags=["Shared with me"])
    app.include_router(admin_router,          prefix="/api/admin",          tags=["Admin"])
    app.include_router(activity_router,       prefix="/api/activity",       tags=["Activity"])
    app.include_router(settings_router,       prefix="/api/settings",       tags=["Settings"])
    app.include_router(todos_router,          prefix="/api/todos",          tags=["Todos"])
    app.include_router(security_router,       prefix="/api/security",       tags=["Security"])
    app.include_router(assistant_router,      prefix="/api/assistant", tags=["AI Assistant"],)
    app.include_router(assistant_admin_router, prefix="/api/assistant/admin",tags=["AI Assistant Admin"],)
    
    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"])
    def health():
        return {"status": "ok", "service": "TrustShare API", "version": "2.0.0"}

    # ── Search Bar ────────────────────────────────────────────────────────────
    app.include_router(
        search_router,
        prefix="/api/search",
        tags=["Search"],
    )

    # The production image bundles the React build with the API. Keep this
    # catch-all last so API and documentation routes continue to take priority.
    frontend_dir = Path(
        os.getenv(
            "FRONTEND_DIST_DIR",
            Path(__file__).resolve().parents[2] / "client" / "build",
        )
    )
    frontend_index = frontend_dir / "index.html"

    if frontend_index.is_file():
        @app.get("/{full_path:path}", include_in_schema=False)
        def serve_frontend(full_path: str):
            if full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="API route not found")

            requested_file = (frontend_dir / full_path).resolve()
            try:
                requested_file.relative_to(frontend_dir.resolve())
            except ValueError:
                raise HTTPException(status_code=404, detail="File not found")

            if requested_file.is_file():
                return FileResponse(requested_file)
            return FileResponse(frontend_index)

    return app


app = create_app()
