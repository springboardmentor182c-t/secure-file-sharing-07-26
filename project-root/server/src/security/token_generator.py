"""
Secure Token Generation utilities for the TrustShare Encryption & Security module.
"""

import secrets
import string


# Default token lengths
DEFAULT_TOKEN_LENGTH = 32
SHARE_TOKEN_LENGTH = 48
DOWNLOAD_TOKEN_LENGTH = 64


def generate_token(length: int = DEFAULT_TOKEN_LENGTH) -> str:
    """
    Generate a cryptographically secure random token.

    Args:
        length:
            Desired token length.

    Returns:
        Secure random token.
    """

    alphabet = string.ascii_letters + string.digits

    return "".join(
        secrets.choice(alphabet)
        for _ in range(length)
    )


def generate_share_token() -> str:
    """
    Generate a secure token for share links.
    """

    return generate_token(
        SHARE_TOKEN_LENGTH
    )


def generate_download_token() -> str:
    """
    Generate a secure download authorization token.
    """

    return generate_token(
        DOWNLOAD_TOKEN_LENGTH
    )


def generate_api_secret(length: int = 64) -> str:
    """
    Generate a cryptographically secure API secret.
    """

    return secrets.token_hex(length // 2)