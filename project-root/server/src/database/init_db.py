from sqlalchemy import text
from src.database.core import Base, engine

# Import all entities so SQLAlchemy knows about them before create_all
from src.entities.user import User            # noqa
from src.entities.folder import Folder        # noqa
from src.entities.file import File            # noqa
from src.entities.share_link import ShareLink  # noqa
from src.entities.notification import Notification # noqa
from src.entities.audit_log import AuditLog    # noqa
from src.entities.blocked_ip import BlockedIP    # noqa


def init_db():
    """Create all tables and perform lightweight schema migrations."""
    Base.metadata.create_all(bind=engine)

    # Ensure share_links table has permission and recipient_email columns
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE share_links ADD COLUMN permission VARCHAR DEFAULT 'view'"))
            conn.commit()
    except Exception:
        pass  # Column already exists

    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE share_links ADD COLUMN recipient_email VARCHAR"))
            conn.commit()
    except Exception:
        pass  # Column already exists
