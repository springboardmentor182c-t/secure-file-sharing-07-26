"""
Secure Storage utilities for the TrustShare Encryption & Security module.

Currently stores encrypted files locally.
Can later be extended to AWS S3 or Azure Blob Storage
without changing encryption logic.
"""

from pathlib import Path

from .exceptions import EncryptionError

# Local encrypted storage
STORAGE_DIR = Path("uploads")
STORAGE_DIR.mkdir(exist_ok=True)


import os  # ensure this is at the top of the file, not inline


def save_encrypted_file(filename: str, encrypted_data: bytes) -> Path:
    """
    Save encrypted file atomically.

    The encrypted file is first written to a temporary file,
    then atomically replaces the previous file.
    """

    destination = STORAGE_DIR / filename
    temp_destination = STORAGE_DIR / f"{filename}.tmp"

    try:

        with open(temp_destination, "wb") as file:
            file.write(encrypted_data)
            file.flush()
            os.fsync(file.fileno())

        os.replace(temp_destination, destination)

        return destination

    except Exception as e:

        if temp_destination.exists():
            temp_destination.unlink()

        raise EncryptionError(f"Unable to save encrypted file: {e}")


def load_encrypted_file(filename: str) -> bytes:
    """
    Load encrypted file from storage.
    """

    path = STORAGE_DIR / filename

    if not path.exists():

        raise FileNotFoundError("Encrypted file not found.")

    with open(path, "rb") as file:

        return file.read()


def delete_encrypted_file(filename: str):
    """
    Delete encrypted file.
    """

    path = STORAGE_DIR / filename

    if path.exists():

        path.unlink()
