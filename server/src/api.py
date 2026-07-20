"""
Aggregates every module's router and registers them on the FastAPI app.

Each teammate adds their module's router here the same way — this file is
shared, so please only ADD to it, don't remove other modules' lines.
"""
from fastapi import FastAPI

from src.recent.controller import router as recent_router
from src.shared_links.controller import (
    analytics_router as shared_links_analytics_router,
    dev_router as shared_links_dev_router,
    notifications_router as shared_links_notifications_router,
    public_router as shared_links_public_router,
    router as shared_links_router,
)

# When the todos/users/auth modules are implemented, import + include their
# routers here too, e.g.:
#   from src.todos.controller import router as todos_router
#   from src.users.controller import router as users_router
#   from src.auth.controller import router as auth_router


def register_routes(app: FastAPI) -> None:
    app.include_router(recent_router)
    app.include_router(shared_links_router)
    app.include_router(shared_links_public_router)
    app.include_router(shared_links_analytics_router)
    app.include_router(shared_links_notifications_router)
    app.include_router(shared_links_dev_router)

    # app.include_router(todos_router)
    # app.include_router(users_router)
    # app.include_router(auth_router)