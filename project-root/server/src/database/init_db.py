from sqlalchemy import inspect

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
from src.entities.login_session import LoginSession  # noqa
from src.entities.notification_pref import NotificationPreference  # noqa


def ensure_file_duplicate_columns(engine_instance=None):
    """Add duplicate-detection columns to existing SQLite/Postgres files tables."""
    if engine_instance is None:
        engine_instance = engine

    inspector = inspect(engine_instance)
    if "files" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("files")}
    column_definitions = {
        "file_hash": "VARCHAR",
        "embedding": "VARCHAR",
        "is_duplicate": "BOOLEAN",
        "duplicate_of": "INTEGER",
        "similarity_score": "FLOAT",
    }

    if not existing_columns.intersection(column_definitions):
        with engine_instance.begin() as connection:
            for column_name, column_type in column_definitions.items():
                connection.exec_driver_sql(f"ALTER TABLE files ADD COLUMN {column_name} {column_type}")
        return

    with engine_instance.begin() as connection:
        for column_name, column_type in column_definitions.items():
            if column_name not in existing_columns:
                connection.exec_driver_sql(f"ALTER TABLE files ADD COLUMN {column_name} {column_type}")


def init_db():
    """Create all tables and seed default configuration."""

    Base.metadata.create_all(bind=engine)
    ensure_file_duplicate_columns(engine)

    db = SessionLocal()

    try:
        seed_configs(db)
        seed_allowed_file_types(db)
    finally:
        db.close()
