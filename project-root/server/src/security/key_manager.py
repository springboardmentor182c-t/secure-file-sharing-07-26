"""
Key Management utilities for the TrustShare Encryption & Security module.
"""

import os
import secrets

from .exceptions import KeyManagementError
from src.config import KEYS_DIR

# Directory to securely store encryption keys
KEYS_DIR.mkdir(parents=True, exist_ok=True)


def generate_key() -> bytes:
    """
    Generate a unique 256-bit AES key.

    Returns:
        32-byte AES-256 key.
    """
    return secrets.token_bytes(32)


def save_key(file_id: str, key: bytes) -> str:
    """
    Save the encryption key atomically.

    Writes to a temporary file first and then atomically
    replaces the existing key file to avoid partial writes.
    """

    key_path = KEYS_DIR / f"{file_id}.key"
    temp_path = KEYS_DIR / f"{file_id}.key.tmp"

    try:

        # Write the new key to a temporary file
        with open(temp_path, "wb") as f:
            f.write(key)
            f.flush()
            os.fsync(f.fileno())

        # Atomically replace the old key
        os.replace(temp_path, key_path)

        return str(key_path)

    except Exception as e:

        # Clean up temp file if something failed
        if temp_path.exists():
            temp_path.unlink()

        raise KeyManagementError(f"Failed to save encryption key: {e}")


def load_key(file_id: str) -> bytes:
    """
    Load the encryption key for a file.

    Args:
        file_id: Unique file identifier.

    Returns:
        AES-256 key.
    """

    key_path = KEYS_DIR / f"{file_id}.key"

    if not key_path.exists():
        raise KeyManagementError("Encryption key not found.")

    with open(key_path, "rb") as f:
        return f.read()


def delete_key(file_id: str):
    """
    Delete a stored encryption key.

    Used when files are permanently removed.
    """

    key_path = KEYS_DIR / f"{file_id}.key"

    if key_path.exists():
        os.remove(key_path)
