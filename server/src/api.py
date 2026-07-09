from fastapi import APIRouter

from src.trash.api import router as trash_router

api_router = APIRouter()

api_router.include_router(trash_router)