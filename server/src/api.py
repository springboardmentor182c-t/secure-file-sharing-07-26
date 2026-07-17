from fastapi import APIRouter
from src.activity_monitor.controller import router as activity_router

api_router = APIRouter()
api_router.include_router(activity_router, prefix="/activity", tags=["Activity Monitor"])