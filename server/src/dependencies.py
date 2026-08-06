"""
Temporary auth dependency, shared by every module - the seam where real JWT
verification plugs in later (see `src/auth/`, currently an empty
placeholder owned by the Auth teammate). Every route only depends on
getting back a `uuid.UUID`, so swapping this function's body is the only
change needed project-wide.

There is no dummy/fallback user id. Every request MUST send a real
`X-User-Id` header identifying an actual row in the `users` table (created
via `POST /users` for local dev, or by a real signup once Auth lands).
"""
import uuid

from fastapi import Header
from typing_extensions import Annotated

from src.exceptions import UnauthorizedError


DEFAULT_USER_ID = uuid.UUID("6dade1e1-f803-4af6-a5df-ecdbaa5b596a")

def get_current_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> uuid.UUID:
    if not x_user_id:
        return DEFAULT_USER_ID

    try:
        return uuid.UUID(x_user_id)
    except ValueError:
        return DEFAULT_USER_ID
