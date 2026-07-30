from fastapi import HTTPException, Request
import logging

from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError


logger = logging.getLogger(__name__)

class AppException(HTTPException):
    pass

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={'detail': exc.detail})


async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(
        "Database error while handling %s",
        request.url.path,
        exc_info=(type(exc), exc, exc.__traceback__),
    )

    is_analytics_request = request.url.path.startswith("/api/analytics")
    if is_analytics_request:
        code = "ANALYTICS_DATABASE_UNAVAILABLE"
        detail = (
            "Analytics is temporarily unavailable because its PostgreSQL "
            "database is not configured correctly or cannot be reached."
        )
    else:
        code = "DATABASE_UNAVAILABLE"
        detail = "The database service is temporarily unavailable."

    return JSONResponse(
        status_code=503,
        content={"detail": detail, "code": code},
    )
