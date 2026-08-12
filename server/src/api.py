
"""
Aggregates every module's router and registers them on the FastAPI app.

Each teammate adds their module's router here the same way — this file is
shared, so please only ADD to it, don't remove other modules' lines.
"""
from fastapi import FastAPI

from src.dashboard.controller import router as dashboard_router
from src.files.controller import folders_router, router as files_router
from src.recent.controller import router as recent_router
from src.shared.controller import router as shared_router
from src.shared_links.controller import (
    analytics_router as shared_links_analytics_router,
    dev_router as shared_links_dev_router,
    notifications_router as shared_links_notifications_router,
    public_router as shared_links_public_router,
    router as shared_links_router,
)
from src.duplicate_controller import router as duplicate_router
from src.trash.api import router as trash_router

# When the todos/users/auth modules are implemented, import + include their
# routers here too, e.g.:
#   from src.todos.controller import router as todos_router
#   from src.users.controller import router as users_router
#   from src.auth.controller import router as auth_router


def register_routes(app: FastAPI) -> None:
    app.include_router(duplicate_router)
    app.include_router(files_router)
    app.include_router(folders_router)
    app.include_router(dashboard_router)
    app.include_router(recent_router)
    app.include_router(shared_router)
    app.include_router(trash_router)

    app.include_router(shared_links_router)
    app.include_router(shared_links_public_router)
    app.include_router(shared_links_analytics_router)
    app.include_router(shared_links_notifications_router)
    app.include_router(shared_links_dev_router)

    # app.include_router(todos_router)
    # app.include_router(users_router)
    # app.include_router(auth_router)
