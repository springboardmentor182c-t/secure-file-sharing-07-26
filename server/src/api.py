from fastapi import APIRouter
from src.auth.controller import router as auth_router
from src.users.controller import router as users_router
from src.todos.controller import router as todos_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(todos_router)
