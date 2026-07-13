import os
from pathlib import Path

MASTER_KEY_FILE = Path("master.key")


def load_master_key() -> bytes:
    """
    Load or generate the server master key.
    """

    if MASTER_KEY_FILE.exists():
        return MASTER_KEY_FILE.read_bytes()

    key = os.urandom(32)

    MASTER_KEY_FILE.write_bytes(key)

    return key
