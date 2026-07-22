from src.database.core import Base, engine, SessionLocal
from src.entities.user import User        # noqa  (kept for SQLAlchemy metadata)
from src.entities.folder import Folder    # noqa  (kept for FK on File.folder_id)
from src.entities.file import File        # noqa
from src.entities.audit_log import AuditLog  # noqa
from src.auth.dependencies import hash_password

import uuid
from datetime import datetime, timedelta, timezone
import random


def init_db():
    """Create all tables and seed initial database records if empty."""
    Base.metadata.create_all(bind=engine)

    # Seed data if database is empty
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            _seed_database(db)
    finally:
        db.close()


def _seed_database(db):
    """Seed real initial users and audit trail logs into DB."""
    users_data = [
        ("Alex Johnson",  "alex.johnson@secureshare.com", "admin",  147 * 1024 * 1024 * 1024),
        ("Sarah Chen",    "sarah.chen@secureshare.com",   "member", 85 * 1024 * 1024 * 1024),
        ("Priya Mehta",   "priya.mehta@secureshare.com",  "member", 42 * 1024 * 1024 * 1024),
        ("Mark Daniels",  "mark.daniels@secureshare.com", "member", 28 * 1024 * 1024 * 1024),
        ("James Wilson",  "james.wilson@secureshare.com", "member", 15 * 1024 * 1024 * 1024),
    ]

    created_users = []
    pwd_hash = hash_password("Password123!")

    for name, email, role, bytes_used in users_data:
        u = User(
            id=uuid.uuid4(),
            name=name,
            email=email,
            hashed_password=pwd_hash,
            role=role,
            plan="enterprise" if role == "admin" else "team",
            storage_used=bytes_used,
            is_active=True,
        )
        db.add(u)
        created_users.append(u)

    db.commit()
    for u in created_users:
        db.refresh(u)

    # Seed Audit Logs over past 90 days to populate real SQL analytics queries
    now = datetime.now(timezone.utc)
    logs_to_create = []

    # Distribution weights for actions per user (Alex does most actions)
    user_weights = [284, 196, 143, 98, 67]

    # Generate events per day for the last 90 days
    for day_offset in range(90, -1, -1):
        day = now - timedelta(days=day_offset)

        # Higher activity in recent 7 days to match ~1,834 uploads, ~1,250 downloads, ~348 shares
        mult = 1.0 if day_offset <= 7 else 0.8

        num_uploads   = int(random.randint(240, 290) * mult)
        num_downloads = int(random.randint(160, 200) * mult)
        num_shares    = int(random.randint(40, 60) * mult)
        num_logins    = random.randint(2, 6)
        num_failures  = random.randint(0, 2)
        num_threats   = random.randint(0, 1)

        actions = (
            [("UPLOAD", "file", "info")] * num_uploads +
            [("DOWNLOAD", "file", "info")] * num_downloads +
            [("SHARE", "share_link", "info")] * num_shares +
            [("LOGIN", "user", "info")] * num_logins +
            [("LOGIN_FAILED", "user", "warn")] * num_failures +
            [("THREAT", "user", "error")] * num_threats
        )

        for act, res_type, lvl in actions:
            u = random.choices(created_users, weights=user_weights, k=1)[0]
            # Randomize time within the day
            second_offset = random.randint(0, 86399)
            log_time = day.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(seconds=second_offset)

            logs_to_create.append(AuditLog(
                id=uuid.uuid4(),
                user_id=u.id,
                action=act,
                resource_type=res_type,
                resource_name=f"resource_{random.randint(100, 999)}",
                ip_address=f"192.168.1.{random.randint(2, 254)}",
                level=lvl,
                created_at=log_time,
            ))

    db.bulk_save_objects(logs_to_create)
    db.commit()
