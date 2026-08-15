"""
Aggregates every module's router and registers them on the FastAPI app.
"""

from fastapi import FastAPI

from src.dashboard.controller import (
    router as dashboard_router,
    users_router,
    settings_router,
)
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
from src.duplicate_controller import router as duplicate_router
from src.trash.api import router as trash_router


from src.ai_summary.controller import router as ai_summary_router
from src.auth.controller import router as auth_router
# When the todos/users/auth modules are implemented, import + include their
# routers here too, e.g.:
#   from src.todos.controller import router as todos_router
#   from src.users.controller import router as users_router
#   from src.auth.controller import router as auth_router



def register_routes(app: FastAPI) -> None:
    app.include_router(duplicate_router)
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
    app.include_router(shared_links_router)
    app.include_router(shared_links_public_router)
    app.include_router(shared_links_notifications_router)
    app.include_router(shared_links_dev_router)
    app.include_router(ai_summary_router)
    app.include_router(auth_router)
    # app.include_router(todos_router)
    # app.include_router(users_router)
    # app.include_router(auth_router)