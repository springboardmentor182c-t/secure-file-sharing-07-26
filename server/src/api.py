from fastapi import APIRouter
from src.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(dashboard_router)