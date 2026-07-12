"""
Import every entity here so `Base.metadata` (used by Alembic and the dev
`create_all` fallback) discovers all tables, and so relationship() string
references resolve regardless of import order.
"""
from src.entities.base import Base  # noqa: F401
from src.entities.user import User  # noqa: F401
from src.entities.file import File  # noqa: F401
from src.entities.shared_link import SharedLink  # noqa: F401
from src.entities.access_log import AccessLog  # noqa: F401
from src.entities.notification import Notification  # noqa: F401

__all__ = ["Base", "User", "File", "SharedLink", "AccessLog", "Notification"]
