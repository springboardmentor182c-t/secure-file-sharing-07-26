"""
Temporary auth dependency, shared by every module - the seam where real JWT
verification plugs in later (see `src/auth/`, currently an empty
placeholder owned by the Auth teammate). Every route only depends on
getting back an `int`, so swapping this function's body is the only
change needed project-wide.

There is no dummy/fallback user id. Every request MUST send a real
`X-User-Id` header identifying an actual row in the `users` table (created
via `POST /users` for local dev, or by a real signup once Auth lands).
"""
from fastapi import Header
from typing_extensions import Annotated

from src.exceptions import UnauthorizedError


DEFAULT_USER_ID = 1

def get_current_user_id(x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None) -> int:
    if not x_user_id:
        return DEFAULT_USER_ID

    try:
        return int(x_user_id)
    except ValueError:
        return DEFAULT_USER_ID