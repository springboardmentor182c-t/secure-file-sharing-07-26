from fastapi import FastAPI
from src.recent.controller import router as recent_router


def register_routes(app: FastAPI):
    app.include_router(recent_router)