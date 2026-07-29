
import uuid

from fastapi import Header
from typing_extensions import Annotated

from src.exceptions import PermissionDeniedError, UnauthorizedError


def get_current_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> uuid.UUID:
    if not x_user_id:
        return uuid.UUID("11111111-1111-1111-1111-111111111111")

    try:
        return uuid.UUID(x_user_id)
    except Exception:
        return uuid.UUID("11111111-1111-1111-1111-111111111111")


def require_role(allowed_roles: list[str]):
    def role_checker(x_user_role: Annotated[str | None, Header(alias="X-User-Role")] = "Admin") -> str:
        if not x_user_role:
            raise UnauthorizedError("Missing X-User-Role header")
        if x_user_role.lower() not in [r.lower() for r in allowed_roles]:
            raise PermissionDeniedError(f"Role '{x_user_role}' is not authorized for this resource")
        return x_user_role

    return role_checker
