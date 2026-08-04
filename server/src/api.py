from fastapi import APIRouter

from src.todos.controller import router as file_router
from src.dashboard import router as dashboard_router
from src.activity_monitor.controller import router as activity_router


# =====================================================
# MAIN API ROUTER
# =====================================================

api_router = APIRouter()

# =====================================================
# HEALTH CHECK
# =====================================================

@api_router.get(
    "/health",
    tags=["Health"]
)
def health_check():
    return {
        "status": "healthy"
    }


# =====================================================
# FILE MANAGEMENT
# =====================================================

api_router.include_router(
    file_router
)


# =====================================================
# DASHBOARD
# =====================================================

api_router.include_router(dashboard_router)


# =====================================================
# ACTIVITY MONITOR
# =====================================================

api_router.include_router(
    activity_router,
    prefix="/activity",
    tags=["Activity Monitor"]
)


# =====================================================
# BACKWARD COMPATIBILITY
# =====================================================
# Some existing code may import:
#
# from src.api import router
#
# while the latest main-group-C may use:
#
# from src.api import api_router
#
# Keeping this alias prevents either import style
# from breaking while resolving the integration.
# =====================================================

router = api_router
