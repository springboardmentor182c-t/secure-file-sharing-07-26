"""align users table with model, add roles and system_services tables

The first two migrations (43fc3e92705f, 219bdf4bd320) never caught up with
src/entities/user.py, src/entities/role.py and src/entities/system_service.py:

  * users.role_id, users.username, users.password_hash,
    users.account_status, users.email_verified, users.last_login,
    users.created_at, users.updated_at were added to the SQLAlchemy model
    but no migration ever created the columns in Postgres.
  * The `roles` table (referenced by users.role_id) was never created at all.
  * The `system_services` table (queried by GET /dashboard/monitoring) was
    never created at all - src/entities/system_service.py was never
    imported by src/entities/__init__.py, so Alembic autogenerate never
    saw it either.

This migration adds every missing column/table, backfills safe defaults
for any pre-existing rows, and only then applies NOT NULL / UNIQUE
constraints so it is safe to run against a database that already has data
in it (matches the current state described in the bug report).

Revision ID: 09f99a40fd55
Revises: 219bdf4bd320
Create Date: 2026-07-26 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

import src.entities.guid

revision: str = "09f99a40fd55"
down_revision: Union[str, None] = "219bdf4bd320"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---- roles ------------------------------------------------------------
    op.create_table(
        "roles",
        sa.Column("id", src.entities.guid.GUID(), nullable=False),
        sa.Column("role_name", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("role_name", name="uq_roles_role_name"),
    )

    # Seed the baseline roles used by the app so users.role_id has
    # something real to point at.
    roles_table = sa.table(
        "roles",
        sa.column("id", src.entities.guid.GUID()),
        sa.column("role_name", sa.String),
    )
    op.bulk_insert(
        roles_table,
        [
            {"id": "11111111-1111-1111-1111-111111111111", "role_name": "Admin"},
            {"id": "22222222-2222-2222-2222-222222222222", "role_name": "Editor"},
            {"id": "33333333-3333-3333-3333-333333333333", "role_name": "Viewer"},
        ],
    )

    # ---- users: add every column the model has but the DB is missing -----
    op.add_column("users", sa.Column("username", sa.String(length=50), nullable=True))
    op.add_column(
        "users",
        sa.Column("role_id", src.entities.guid.GUID(), nullable=True),
    )
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.add_column(
        "users",
        sa.Column("account_status", sa.String(length=20), nullable=False, server_default="ACTIVE"),
    )
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("users", sa.Column("last_login", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "users",
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # full_name was created NOT NULL by the very first migration, but the
    # current model marks it optional (e.g. invite flows that only know an
    # email address). Relax it to match the model.
    op.alter_column("users", "full_name", existing_type=sa.String(length=255), nullable=True)

    # Backfill a unique username for any pre-existing rows (the local part
    # of the email plus the first 8 chars of the row's id, so collisions
    # between two emails with the same local part are still unique) before
    # the column is locked down to NOT NULL + UNIQUE. Done in Python (not
    # a dialect-specific UPDATE) so this migration works against both the
    # Postgres production DB and the SQLite dev DB, matching every other
    # entity in this project (see src/entities/guid.py).
    bind = op.get_bind()
    users_table = sa.table(
        "users",
        sa.column("id", src.entities.guid.GUID()),
        sa.column("email", sa.String),
        sa.column("username", sa.String),
    )
    existing_users = bind.execute(
        sa.select(users_table.c.id, users_table.c.email).where(users_table.c.username.is_(None))
    ).fetchall()
    for user_id, email in existing_users:
        local_part = (email or "user").split("@")[0]
        generated_username = f"{local_part}_{str(user_id).replace('-', '')[:8]}"
        bind.execute(
            users_table.update()
            .where(users_table.c.id == user_id)
            .values(username=generated_username)
        )

    op.alter_column("users", "username", existing_type=sa.String(length=50), nullable=False)
    op.create_unique_constraint("uq_users_username", "users", ["username"])

    op.create_foreign_key("fk_users_role_id", "users", "roles", ["role_id"], ["id"])

    # ---- system_services ----------------------------------------------------
    op.create_table(
        "system_services",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("service_name", sa.String(length=100), nullable=False),
        sa.Column("latency_ms", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("uptime_percent", sa.Numeric(5, 2), nullable=False, server_default="99.9"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="Operational"),
        sa.PrimaryKeyConstraint("id"),
    )

    system_services_table = sa.table(
        "system_services",
        sa.column("service_name", sa.String),
        sa.column("latency_ms", sa.Numeric),
        sa.column("uptime_percent", sa.Numeric),
        sa.column("status", sa.String),
    )
    op.bulk_insert(
        system_services_table,
        [
            {"service_name": "API Server", "latency_ms": 42.0, "uptime_percent": 99.98, "status": "Operational"},
            {"service_name": "PostgreSQL Database", "latency_ms": 8.5, "uptime_percent": 99.99, "status": "Operational"},
            {"service_name": "File Storage", "latency_ms": 65.0, "uptime_percent": 99.95, "status": "Operational"},
            {"service_name": "Email Service", "latency_ms": 120.0, "uptime_percent": 99.90, "status": "Operational"},
        ],
    )


def downgrade() -> None:
    op.drop_table("system_services")

    op.drop_constraint("fk_users_role_id", "users", type_="foreignkey")
    op.drop_constraint("uq_users_username", "users", type_="unique")

    op.alter_column("users", "full_name", existing_type=sa.String(length=255), nullable=False)

    op.drop_column("users", "updated_at")
    op.drop_column("users", "created_at")
    op.drop_column("users", "last_login")
    op.drop_column("users", "email_verified")
    op.drop_column("users", "account_status")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "role_id")
    op.drop_column("users", "username")

    op.drop_table("roles")
