"""
SHA-256 hashing utilities for the TrustShare Encryption & Security module.
"""

import hashlib
from pathlib import Path


def calculate_sha256(file_path: str | Path) -> str:
    """
    Calculate the SHA-256 hash of a file.

    Args:
        file_path: Path to the file.

    Returns:
        Hexadecimal SHA-256 hash string.
    """

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        while chunk := file.read(64 * 1024):
            sha256.update(chunk)

    return sha256.hexdigest()


def verify_sha256(file_path: str | Path, expected_hash: str) -> bool:
    """
    Verify file integrity using SHA-256.

    Args:
        file_path: Path to the file.
        expected_hash: Previously stored SHA-256 hash.

    Returns:
        True if hashes match, otherwise False.
    """

    return calculate_sha256(file_path) == expected_hash
