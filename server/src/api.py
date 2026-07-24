from fastapi import APIRouter

from src.todos.controller import router as file_router


router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy"
    }


router.include_router(file_router)