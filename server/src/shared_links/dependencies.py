"""
Temporary auth dependency — the seam where the Auth teammate's real JWT
verification (they already have `python-jose` in requirements.txt) plugs
in later. Every route below only depends on getting back a `uuid.UUID`, so
swapping this function's body is the only change needed project-wide.
"""
import os
import uuid

from fastapi import Header
from typing_extensions import Annotated

from src.exceptions import UnauthorizedError

AUTH_DEV_FALLBACK = os.getenv("AUTH_DEV_FALLBACK", "true").lower() == "true"

# Fixed UUID used only when AUTH_DEV_FALLBACK=true and no X-User-Id header is
# supplied — convenient for exploring /docs without a real auth token.
# NEVER rely on this in production (set AUTH_DEV_FALLBACK=false).
DEV_FALLBACK_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def get_current_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> uuid.UUID:
    if x_user_id:
        try:
            return uuid.UUID(x_user_id)
        except ValueError:
            raise UnauthorizedError("X-User-Id header must be a valid UUID")

    if AUTH_DEV_FALLBACK:
        return DEV_FALLBACK_USER_ID

    raise UnauthorizedError("Missing X-User-Id header")
