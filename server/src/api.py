"""
Aggregates every module's router and registers them on the FastAPI app.
"""

from fastapi import FastAPI

from src.ai_recommendation.controller import router as ai_recommendation_router
from src.dashboard.controller import router as dashboard_router
from src.files.controller import folders_router, router as files_router
from src.recent.controller import router as recent_router
from src.analytics.controller import router as analytics_router
from src.security.controller import router as security_router
from src.audit.controller import router as audit_router
from src.shared.controller import router as shared_router

from src.shared_links.controller import (
    api_shared_router,
    analytics_router as shared_links_analytics_router,
    dev_router as shared_links_dev_router,
    notifications_router as shared_links_notifications_router,
    public_router as shared_links_public_router,
    router as shared_links_router,
)
from src.trash.api import router as trash_router


def register_routes(app: FastAPI) -> None:
    app.include_router(files_router)
    app.include_router(folders_router)
    app.include_router(dashboard_router, prefix="/api")
    app.include_router(users_router, prefix="/api")
    app.include_router(settings_router, prefix="/api")

    app.include_router(analytics_router)
    app.include_router(security_router)
    app.include_router(audit_router)
    app.include_router(api_shared_router)

    app.include_router(recent_router)
    app.include_router(shared_router)
    app.include_router(trash_router)
    app.include_router(ai_recommendation_router)

    app.include_router(shared_links_router)
    app.include_router(shared_links_public_router)
    app.include_router(shared_links_notifications_router)
    app.include_router(shared_links_dev_router)
