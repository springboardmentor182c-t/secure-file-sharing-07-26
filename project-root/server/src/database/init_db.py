from src.database.core import Base, engine

# Import all entities so SQLAlchemy knows about them before create_all
from src.entities.user import User  # noqa
from src.entities.todo import Todo  # noqa
from src.entities.folder import Folder  # noqa
from src.entities.file import File  # noqa
from src.entities.share_link import ShareLink  # noqa
from src.entities.file_permission import FilePermission  # noqa
from src.entities.audit_log import AuditLog  # noqa
from src.entities.notification import Notification  # noqa


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
