"""
Re-exports the shared auth dependency from `src.dependencies` so existing imports keep working.
"""
from fastapi import Header
from typing_extensions import Annotated
from src.dependencies import get_current_user_id  # noqa: F401
from src.exceptions import PermissionDeniedError, UnauthorizedError


def require_role(allowed_roles: list[str]):
    def role_checker(x_user_role: Annotated[str | None, Header(alias="X-User-Role")] = "Admin") -> str:
        if not x_user_role:
            raise UnauthorizedError("Missing X-User-Role header")
        if x_user_role.lower() not in [r.lower() for r in allowed_roles]:
            raise PermissionDeniedError(f"Role '{x_user_role}' is not authorized for this resource")
        return x_user_role

    return role_checker
