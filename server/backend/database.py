import sqlite3
import os
from datetime import datetime
from contextlib import contextmanager

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "metadata.db")

def get_db_connection():
    """Establishes and returns a database connection with dictionary-like row access and foreign key enforcement."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def db_session(commit=False):
    """Context manager to ensure connections are closed and transactions are committed or rolled back."""
    conn = get_db_connection()
    try:
        yield conn
        if commit:
            conn.commit()
    except Exception:
        if commit:
            conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initializes the database schema if it doesn't already exist."""
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    
    with db_session(commit=True) as conn:
        cursor = conn.cursor()
        
        # Table to store metadata of successfully uploaded files
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type TEXT NOT NULL,
                sha256_hash TEXT NOT NULL UNIQUE,
                stored_name TEXT NOT NULL,
                category TEXT NOT NULL,
                perceptual_hash TEXT, -- Stored image hash or other similarity feature
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Table to store logs of duplicate uploads prevented by the system
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS duplicate_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                sha256_hash TEXT NOT NULL,
                duplicate_type TEXT NOT NULL, -- 'exact' or 'near'
                similarity_score REAL NOT NULL, -- 1.0 for exact, 0.0-1.0 for near
                target_file_id INTEGER, -- ID of the original stored file it matched
                target_file_name TEXT, -- Name of the original stored file it matched
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (target_file_id) REFERENCES files (id) ON DELETE SET NULL
            )
        """)

def store_file_metadata(filename: str, file_size: int, mime_type: str, sha256_hash: str, stored_name: str, category: str, perceptual_hash: str = None) -> dict:
    """Stores a file's metadata and returns the saved record."""
    with db_session(commit=True) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO files (filename, file_size, mime_type, sha256_hash, stored_name, category, perceptual_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (filename, file_size, mime_type, sha256_hash, stored_name, category, perceptual_hash)
        )
        
        # Fetch the newly created record
        file_id = cursor.lastrowid
        cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
        row = cursor.fetchone()
        return dict(row) if row else {}

def check_exact_duplicate(sha256_hash: str) -> dict:
    """Checks if a file with the given SHA-256 hash already exists in the database."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM files WHERE sha256_hash = ?", (sha256_hash,))
        row = cursor.fetchone()
        return dict(row) if row else None

def get_all_files():
    """Retrieves all stored files, sorted by upload date descending (with ID fallback)."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM files ORDER BY upload_date DESC, id DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_files_by_category(category: str):
    """Retrieves all stored files of a specific category."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM files WHERE category = ? ORDER BY upload_date DESC, id DESC", (category,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_file_by_id(file_id: int) -> dict:
    """Retrieves a single file metadata record by ID."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def log_duplicate_attempt(filename: str, file_size: int, sha256_hash: str, duplicate_type: str, similarity_score: float, target_file_id: int, target_file_name: str):
    """Logs a blocked duplicate upload attempt."""
    with db_session(commit=True) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO duplicate_logs (filename, file_size, sha256_hash, duplicate_type, similarity_score, target_file_id, target_file_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (filename, file_size, sha256_hash, duplicate_type, similarity_score, target_file_id, target_file_name)
        )

def get_duplicate_logs():
    """Retrieves logs of duplicate prevention activities, sorted by timestamp descending (with ID fallback)."""
    with db_session() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM duplicate_logs ORDER BY timestamp DESC, id DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_dashboard_stats() -> dict:
    """Computes statistics for the dashboard."""
    with db_session() as conn:
        cursor = conn.cursor()
        
        # 1. Total Stored Files
        cursor.execute("SELECT COUNT(*) as count FROM files")
        total_files = cursor.fetchone()["count"]
        
        # 2. Total Blocked Duplicates (Exact + Near duplicates logged)
        cursor.execute("SELECT COUNT(*) as count FROM duplicate_logs")
        blocked_duplicates = cursor.fetchone()["count"]
        
        # 3. Total Storage Saved in Bytes (Sum of size of blocked duplicate attempts)
        cursor.execute("SELECT SUM(file_size) as saved FROM duplicate_logs")
        saved_row = cursor.fetchone()
        storage_saved_bytes = saved_row["saved"] if saved_row["saved"] is not None else 0
        
        # 4. Storage Used in Bytes (Sum of size of stored files)
        cursor.execute("SELECT SUM(file_size) as used FROM files")
        used_row = cursor.fetchone()
        storage_used_bytes = used_row["used"] if used_row["used"] is not None else 0
        
        return {
            "total_files": total_files,
            "blocked_duplicates": blocked_duplicates,
            "storage_saved_bytes": storage_saved_bytes,
            "storage_used_bytes": storage_used_bytes
        }

def delete_file_by_id(file_id: int) -> bool:
    """Deletes a file record by ID. Returns True if found and deleted, False otherwise."""
    with db_session(commit=True) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM files WHERE id = ?", (file_id,))
        return cursor.rowcount > 0
