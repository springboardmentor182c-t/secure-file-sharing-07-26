"""add notification fields

Revision ID: xxxx
Revises: dcaf52883b75
"""

from alembic import op
import sqlalchemy as sa


revision = "xxxx"
down_revision = "dcaf52883b75"
branch_labels = None
depends_on = None


def upgrade() -> None:

    op.add_column(
        "notifications",
        sa.Column(
            "notification_type",
            sa.String(length=50),
            nullable=True
        )
    )

    op.add_column(
        "notifications",
        sa.Column(
            "related_entity",
            sa.String(length=100),
            nullable=True
        )
    )

    op.add_column(
        "notifications",
        sa.Column(
            "related_entity_id",
            sa.String(length=255),
            nullable=True
        )
    )


def downgrade() -> None:

    op.drop_column(
        "notifications",
        "related_entity_id"
    )

    op.drop_column(
        "notifications",
        "related_entity"
    )

    op.drop_column(
        "notifications",
        "notification_type"
    )