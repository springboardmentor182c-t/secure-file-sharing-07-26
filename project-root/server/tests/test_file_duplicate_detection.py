import os
import tempfile

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from src.database.core import Base
from src.database.init_db import ensure_file_duplicate_columns
from src.entities.file import File
from src.files import service


def test_ensure_file_duplicate_columns_adds_missing_columns():
    engine = create_engine("sqlite:///:memory:")

    with engine.begin() as conn:
        conn.exec_driver_sql(
            """
            CREATE TABLE files (
                id INTEGER PRIMARY KEY,
                original_name VARCHAR NOT NULL,
                stored_name VARCHAR NOT NULL,
                mimetype VARCHAR NOT NULL,
                size BIGINT NOT NULL,
                encrypted BOOLEAN,
                hash_sha256 VARCHAR,
                version INTEGER,
                owner_id INTEGER NOT NULL,
                folder_id INTEGER,
                is_deleted BOOLEAN,
                download_count INTEGER,
                last_downloaded_at DATETIME,
                created_at DATETIME,
                updated_at DATETIME
            )
            """
        )

    ensure_file_duplicate_columns(engine)

    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("files")}

    assert {"file_hash", "embedding", "is_duplicate", "duplicate_of", "similarity_score"}.issubset(columns)


def test_detect_duplicate_returns_exact_match_for_same_hash():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    with Session() as session:
        existing = File(
            original_name="existing.pdf",
            stored_name="existing.pdf",
            mimetype="application/pdf",
            size=100,
            encrypted=False,
            hash_sha256="abc123",
            file_hash="abc123",
            embedding=None,
            is_duplicate=False,
            duplicate_of=None,
            similarity_score=None,
            owner_id=1,
            folder_id=None,
        )
        session.add(existing)
        session.commit()

        duplicate = service._detect_duplicate(
            db=session,
            owner_id=1,
            file_bytes=b"file-bytes",
            file_name="copy.pdf",
            mimetype="application/pdf",
            file_hash="abc123",
        )

        assert duplicate is not None
        assert duplicate["is_duplicate"] is True
        assert duplicate["duplicate"] is True
        assert duplicate["type"] == "exact"
