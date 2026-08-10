"""Runtime configuration shared by local development and production."""

import os
from pathlib import Path


ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()


def _data_dir() -> Path:
    configured = os.getenv("DATA_DIR", "").strip()
    return Path(configured).expanduser() if configured else Path.cwd()


DATA_DIR = _data_dir()
UPLOADS_DIR = DATA_DIR / "uploads"
KEYS_DIR = DATA_DIR / "keys"
MASTER_KEY_FILE = DATA_DIR / "master.key"


def _required_url(variable_name: str) -> str:
    """Load a required public URL from the environment."""
    configured = os.getenv(variable_name, "").strip().rstrip("/")
    if not configured:
        raise RuntimeError(f"{variable_name} must be configured")
    return configured


def frontend_url() -> str:
    """Return the public application URL, including its URL scheme."""
    return _required_url("FRONTEND_URL")


def backend_url() -> str:
    """Return the public backend URL used for OAuth callback defaults."""
    return _required_url("BACKEND_URL")


def cors_origins() -> list[str]:
    """Load the required comma-separated CORS allowlist."""
    configured = os.getenv("BACKEND_CORS_ORIGINS", "").strip()
    if not configured:
        raise RuntimeError("BACKEND_CORS_ORIGINS must be configured")
    return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]
