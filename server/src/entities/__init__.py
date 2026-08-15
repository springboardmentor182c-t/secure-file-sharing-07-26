"""
Import every entity here so Base.metadata (used by Alembic and the dev
create_all fallback) discovers all tables, and so relationship() string
references resolve regardless of import order.

NOTE: src.entities.security_event and src.entities.encryption_key are
intentionally NOT imported here. They belong to a separate, unregistered
security dashboard module that defines its own SQLAlchemy declarative Base
and would otherwise pull in extra dependencies at import time.
"""
from src.entities.access_log import AccessLog  # noqa: F401
from src.entities.base import Base  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.file_category import FileCategory  # noqa: F401
from src.entities.file_summary import FileSummary  # noqa: F401
from src.entities.folder import Folder  # noqa: F401
from src.entities.notification import Notification  # noqa: F401
from src.entities.role import Role  # noqa: F401
from src.entities.security_event import SecurityEvent  # noqa: F401
from src.entities.shared_link import SharedLink  # noqa: F401
from src.entities.system_service import SystemService  # noqa: F401
from src.entities.user import User  # noqa: F401

__all__ = [
    "Base",
    "User",
    "Folder",
    "File",
    "FileCategory",
    "FileSummary",
    "SharedLink",
    "AccessLog",
    "Notification",
    "Role",
    "SystemService",
]

