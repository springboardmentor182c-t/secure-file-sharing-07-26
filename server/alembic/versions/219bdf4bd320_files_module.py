"""files module: folders table, real files schema, user storage quota

Revision ID: 219bdf4bd320
Revises: 43fc3e92705f
Create Date: 2026-07-18 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

import src.entities.guid

revision: str = '219bdf4bd320'
down_revision: Union[str, None] = '43fc3e92705f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_STORAGE_QUOTA_BYTES = 500 * 1024 * 1024 * 1024  # 500GB - matches User.DEFAULT_STORAGE_QUOTA_BYTES's default


def upgrade() -> None:
    # ---- folders --------------------------------------------------------
    op.create_table(
        'folders',
        sa.Column('id', src.entities.guid.GUID(), nullable=False),
        sa.Column('owner_id', src.entities.guid.GUID(), nullable=False),
        sa.Column('parent_id', src.entities.guid.GUID(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.ForeignKeyConstraint(['parent_id'], ['folders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('owner_id', 'parent_id', 'name', name='uq_folder_owner_parent_name'),
    )
    op.create_index('ix_folders_owner_id', 'folders', ['owner_id'])
    op.create_index('ix_folders_parent_id', 'folders', ['parent_id'])

    # ---- users: storage quota --------------------------------------------
    op.add_column(
        'users',
        sa.Column('storage_quota_bytes', sa.BigInteger(), nullable=False, server_default=str(DEFAULT_STORAGE_QUOTA_BYTES)),
    )

    # ---- files: rename placeholder columns to the real schema -----------
    op.alter_column('files', 'file_name', new_column_name='original_filename')
    op.alter_column('files', 'file_type', new_column_name='extension', type_=sa.String(length=20))
    op.alter_column('files', 'storage_path', new_column_name='file_path')
    op.alter_column('files', 'size_bytes', new_column_name='size')

    op.execute("UPDATE files SET content_type = 'application/octet-stream' WHERE content_type IS NULL")
    op.alter_column('files', 'content_type', new_column_name='mime_type', nullable=False,
                     server_default='application/octet-stream')

    # ---- files: new columns ----------------------------------------------
    op.add_column('files', sa.Column('folder_id', src.entities.guid.GUID(), nullable=True))
    op.add_column('files', sa.Column('stored_filename', sa.String(length=255), nullable=True))
    op.add_column('files', sa.Column('storage_provider', sa.String(length=20), nullable=False, server_default='local'))
    op.add_column('files', sa.Column('checksum', sa.String(length=64), nullable=False, server_default=''))
    op.add_column('files', sa.Column('encryption_status', sa.String(length=20), nullable=False, server_default='unencrypted'))
    op.add_column('files', sa.Column('category', sa.String(length=50), nullable=False, server_default='Other'))
    op.add_column('files', sa.Column('is_starred', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('files', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('files', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('files', sa.Column('download_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('files', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))

    # Backfill stored_filename for any pre-existing rows (fresh dev DBs will
    # have none), then enforce NOT NULL + uniqueness.
    op.execute("UPDATE files SET stored_filename = id::text WHERE stored_filename IS NULL")
    op.alter_column('files', 'stored_filename', nullable=False)
    op.create_unique_constraint('uq_files_stored_filename', 'files', ['stored_filename'])

    op.create_foreign_key('fk_files_folder_id', 'files', 'folders', ['folder_id'], ['id'], ondelete='SET NULL')
    op.create_index('ix_files_folder_id', 'files', ['folder_id'])
    op.create_index('ix_files_is_deleted', 'files', ['is_deleted'])


def downgrade() -> None:
    op.drop_index('ix_files_is_deleted', table_name='files')
    op.drop_index('ix_files_folder_id', table_name='files')
    op.drop_constraint('fk_files_folder_id', 'files', type_='foreignkey')
    op.drop_constraint('uq_files_stored_filename', 'files', type_='unique')

    op.drop_column('files', 'updated_at')
    op.drop_column('files', 'download_count')
    op.drop_column('files', 'deleted_at')
    op.drop_column('files', 'is_deleted')
    op.drop_column('files', 'is_starred')
    op.drop_column('files', 'category')
    op.drop_column('files', 'encryption_status')
    op.drop_column('files', 'checksum')
    op.drop_column('files', 'storage_provider')
    op.drop_column('files', 'stored_filename')
    op.drop_column('files', 'folder_id')

    op.alter_column('files', 'mime_type', new_column_name='content_type', nullable=True, server_default=None)
    op.alter_column('files', 'size', new_column_name='size_bytes')
    op.alter_column('files', 'file_path', new_column_name='storage_path')
    op.alter_column('files', 'extension', new_column_name='file_type', type_=sa.String(length=50))
    op.alter_column('files', 'original_filename', new_column_name='file_name')

    op.drop_column('users', 'storage_quota_bytes')

    op.drop_index('ix_folders_parent_id', table_name='folders')
    op.drop_index('ix_folders_owner_id', table_name='folders')
    op.drop_table('folders')
