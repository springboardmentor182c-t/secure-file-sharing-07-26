"""
AES-256 Encryption utilities for the TrustShare Encryption & Security module.

Implements server-side AES-256-GCM encryption and decryption.
"""

import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .exceptions import EncryptionError, DecryptionError

NONCE_SIZE = 12  # Recommended size for AES-GCM


def encrypt_bytes(data: bytes, key: bytes) -> bytes:
    """
    Encrypt bytes using AES-256-GCM.

    Args:
        data: Plain file bytes.
        key: 32-byte AES key.

    Returns:
        Encrypted bytes with nonce prefixed.
    """

    try:
        aes = AESGCM(key)

        nonce = os.urandom(NONCE_SIZE)

        encrypted = aes.encrypt(nonce, data, None)

        return nonce + encrypted

    except Exception as e:
        raise EncryptionError(f"Encryption failed: {e}")


def decrypt_bytes(data: bytes, key: bytes) -> bytes:
    """
    Decrypt AES-256-GCM encrypted bytes.

    Args:
        data: Nonce + encrypted bytes.
        key: AES-256 key.

    Returns:
        Original plaintext bytes.
    """

    try:
        nonce = data[:NONCE_SIZE]

        ciphertext = data[NONCE_SIZE:]

        aes = AESGCM(key)

        return aes.decrypt(nonce, ciphertext, None)

    except Exception as e:
        raise DecryptionError(f"Decryption failed: {e}")
