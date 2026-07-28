from src.database.core import Base, engine

# Import all entities so SQLAlchemy knows about them before create_all
from src.entities.user import User        # noqa
from src.entities.folder import Folder    # noqa  (kept for FK on File.folder_id)
from src.entities.file import File        # noqa
from src.entities.audit_log import AuditLog  # noqa


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
