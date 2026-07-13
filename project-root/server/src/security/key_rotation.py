"""
Key Rotation utilities for the TrustShare Encryption & Security module.
"""

from datetime import datetime, timedelta

from .key_manager import (
    generate_key,
    save_key,
    load_key,
)
from .exceptions import KeyManagementError

# Rotate every 90 days by default
KEY_ROTATION_DAYS = 90


def should_rotate(last_rotation: datetime) -> bool:
    """
    Determine whether a key should be rotated.

    Args:
        last_rotation:
            Datetime of the previous rotation.

    Returns:
        True if rotation is required.
    """

    return datetime.utcnow() >= (last_rotation + timedelta(days=KEY_ROTATION_DAYS))
