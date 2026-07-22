"""
Import every entity here so `Base.metadata` (used by Alembic and the dev
`create_all` fallback) discovers all tables, and so relationship() string
references resolve regardless of import order.

NOTE: `src.entities.security_event` and `src.entities.encryption_key` are
intentionally NOT imported here. They belong to a separate, unregistered
"security dashboard" module (see `src/core.py`, `src/security/`) that
defines its own SQLAlchemy declarative `Base` - a different one from
`src.entities.base.Base` used by every real entity in this app - and its
`src/core.py` eagerly creates a database engine requiring the `pg8000`
driver at import time, which isn't even in requirements.txt (this project
uses psycopg2). Importing them here crashed the whole app on startup
(main.py, Alembic, and every test all run `import src.entities`). No
route in `src/api.py` references them, so nothing is lost by leaving them
out - whoever owns that module can wire it up properly (onto the same
`Base`, with a real driver) when it's ready.
"""
from src.entities.base import Base  # noqa: F401
from src.entities.user import User  # noqa: F401
from src.entities.folder import Folder  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.shared_link import SharedLink  # noqa: F401
from src.entities.access_log import AccessLog  # noqa: F401
from src.entities.notification import Notification  # noqa: F401

__all__ = [
    "Base",
    "User",
    "Folder",
    "File",
    "SharedLink",
    "AccessLog",
    "Notification",
]

