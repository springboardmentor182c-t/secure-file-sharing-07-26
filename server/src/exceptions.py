"""
Shared application exception hierarchy + FastAPI exception handlers.

Any module's service layer can raise these; `register_exception_handlers`
(called once from `src/main.py`) converts them into a standardized JSON
error response so every module's errors look the same to the frontend.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("app.errors")


class AppError(Exception):
    status_code: int = 500
    error_code: str = "internal_error"

    def __init__(self, message: str, *, error_code: str | None = None):
        super().__init__(message)
        self.message = message
        if error_code:
            self.error_code = error_code


class NotFoundError(AppError):
    status_code = 404
    error_code = "not_found"


class ValidationError(AppError):
    status_code = 422
    error_code = "validation_error"


class PermissionDeniedError(AppError):
    status_code = 403
    error_code = "permission_denied"


class UnauthorizedError(AppError):
    status_code = 401
    error_code = "unauthorized"


class ConflictError(AppError):
    status_code = 409
    error_code = "conflict"


class LinkExpiredError(AppError):
    status_code = 410
    error_code = "link_expired"


class LinkUnavailableError(AppError):
    status_code = 410
    error_code = "link_unavailable"


class InvalidPasswordError(AppError):
    status_code = 401
    error_code = "invalid_password"


class PasswordRequiredError(AppError):
    status_code = 401
    error_code = "password_required"


class DownloadNotAllowedError(AppError):
    status_code = 403
    error_code = "download_not_allowed"


class FileTooLargeError(AppError):
    status_code = 413
    error_code = "file_too_large"


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        logger.warning("%s %s -> %s: %s", request.method, request.url.path, exc.error_code, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error_code": exc.error_code, "message": exc.message},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error_code": "validation_error",
                "message": "One or more fields are invalid.",
                "details": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error_code": "internal_error", "message": "An unexpected error occurred."},
        )
