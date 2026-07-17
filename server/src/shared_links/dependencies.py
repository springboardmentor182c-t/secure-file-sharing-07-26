
import uuid

from fastapi import Header
from typing_extensions import Annotated

from src.exceptions import UnauthorizedError


def get_current_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> uuid.UUID:
    if not x_user_id:
        raise UnauthorizedError("Missing X-User-Id header")

    try:
        return uuid.UUID(x_user_id)
    except ValueError:
        raise UnauthorizedError("X-User-Id header must be a valid UUID")
