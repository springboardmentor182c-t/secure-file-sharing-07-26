"""update file schema for trash module

Revision ID: dcaf52883b75
Revises: 06ff21beb6be

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import src.entities.guid


revision: str = "dcaf52883b75"
down_revision: Union[str, None] = "43fc3e92705f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # Create folders table
    op.create_table(
        "folders",
        sa.Column("id", src.entities.guid.GUID(), nullable=False),
        sa.Column("owner_id", src.entities.guid.GUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


    # Create categories table
    op.create_table(
        "file_categories",
        sa.Column("id", src.entities.guid.GUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


    # Add missing columns to files table

    columns = [
        ("folder_id", src.entities.guid.GUID()),
        ("category_id", src.entities.guid.GUID()),
        ("original_name", sa.String(length=255)),
        ("file_extension", sa.String(length=20)),
        ("mime_type", sa.String(length=100)),
        ("file_size", sa.BigInteger()),
        ("encrypted_path", sa.String()),
        ("checksum", sa.String(length=255)),
        ("description", sa.String()),
        ("is_deleted", sa.Boolean()),
        ("uploaded_at", sa.DateTime(timezone=True)),
        ("updated_at", sa.DateTime(timezone=True)),
    ]

    for name, column_type in columns:
        op.add_column(
            "files",
            sa.Column(
                name,
                column_type,
                nullable=True,
            )
        )


def downgrade() -> None:

    columns = [
        "folder_id",
        "category_id",
        "original_name",
        "file_extension",
        "mime_type",
        "file_size",
        "encrypted_path",
        "checksum",
        "description",
        "is_deleted",
        "uploaded_at",
        "updated_at",
    ]

    for column in columns:
        op.drop_column("files", column)

    op.drop_table("file_categories")
    op.drop_table("folders")