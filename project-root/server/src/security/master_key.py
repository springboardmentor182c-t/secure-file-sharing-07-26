import os
import hashlib
from src.config import ENVIRONMENT, MASTER_KEY_FILE


def load_master_key() -> bytes:
    """
    Load or generate the server master key.
    """

    configured_key = os.getenv("MASTER_KEY", "").strip()
    if configured_key:
        return hashlib.sha256(configured_key.encode("utf-8")).digest()

    if ENVIRONMENT == "production":
        raise RuntimeError("MASTER_KEY must be configured in production")

    if MASTER_KEY_FILE.exists():
        return MASTER_KEY_FILE.read_bytes()

    key = os.urandom(32)

    MASTER_KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    MASTER_KEY_FILE.write_bytes(key)

    return key
