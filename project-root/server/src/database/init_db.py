from src.database.core import Base, engine
from src.database.core import Base, engine, SessionLocal
from src.security.seed.seed_config import seed_configs
from src.security.models.allowed_file_type import AllowedFileType
from src.security.seed.seed_allowed_file_types import seed_allowed_file_types
from src.security.models.app_config import AppConfig

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
    """Create all tables and seed default configuration."""

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        seed_configs(db)
        seed_allowed_file_types(db)
    finally:
        db.close()
