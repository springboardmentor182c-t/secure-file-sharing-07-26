"""
Real at-rest encryption for uploaded file bytes (AES-256-GCM). This is what
`File.encryption_status` actually reflects - not just a label.

Key management: a single server-side master key from `FILES_ENCRYPTION_KEY`
(a urlsafe-base64-encoded 32-byte key). Generate one with:

    python -c "import os, base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"

Each file gets its own random 12-byte nonce, stored as a prefix on the
ciphertext on disk (nonce || ciphertext-with-tag) so no separate nonce
column/table is needed. Losing `FILES_ENCRYPTION_KEY` means losing access
to every encrypted file - back it up like any other production secret.
"""
import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

_NONCE_SIZE = 12


class EncryptionKeyMissingError(RuntimeError):
    pass


def _load_key() -> bytes:
    raw = os.getenv("FILES_ENCRYPTION_KEY")
    if not raw:
        raise EncryptionKeyMissingError(
            "FILES_ENCRYPTION_KEY is not set. Generate one with:\n"
            "  python -c \"import os, base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())\"\n"
            "and put it in server/.env."
        )
    try:
        key = base64.urlsafe_b64decode(raw)
    except Exception as exc:  # noqa: BLE001
        raise EncryptionKeyMissingError("FILES_ENCRYPTION_KEY is not valid urlsafe-base64") from exc
    if len(key) != 32:
        raise EncryptionKeyMissingError("FILES_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256)")
    return key


def encrypt_bytes(plaintext: bytes) -> bytes:
    key = _load_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(_NONCE_SIZE)
    ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data=None)
    return nonce + ciphertext


def decrypt_bytes(blob: bytes) -> bytes:
    key = _load_key()
    aesgcm = AESGCM(key)
    nonce, ciphertext = blob[:_NONCE_SIZE], blob[_NONCE_SIZE:]
    return aesgcm.decrypt(nonce, ciphertext, associated_data=None)
