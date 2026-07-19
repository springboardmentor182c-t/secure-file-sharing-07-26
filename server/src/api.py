from fastapi import FastAPI

from .dashboard.controller import router as dashboard_router


def register_routes(app: FastAPI) -> None:
    app.include_router(dashboard_router, prefix="/api")