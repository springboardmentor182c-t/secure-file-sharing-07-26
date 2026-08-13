"""
Auth dependency shared by every module. Prefers a real JWT in the
`Authorization: Bearer <token>` header (issued by src/auth); falls back to
the legacy `X-User-Id` header for any route/tool that hasn't switched over
yet, and finally to DEFAULT_USER_ID for local dev with no auth at all.
"""
from fastapi import Header
from typing_extensions import Annotated

from src.auth.service import decode_token
from src.exceptions import UnauthorizedError

DEFAULT_USER_ID = 1


def get_current_user_id(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> int:
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        return decode_token(token, expected_type="access")

    if x_user_id:
        try:
            return int(x_user_id)
        except ValueError:
            return DEFAULT_USER_ID

    return DEFAULT_USER_ID