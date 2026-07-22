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


def frontend_url() -> str:
    """Return the public application URL, including its URL scheme."""
    configured = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
    if configured:
        return configured

    render_hostname = os.getenv("RENDER_EXTERNAL_HOSTNAME", "").strip()
    if render_hostname:
        return f"https://{render_hostname}"

    return "http://localhost:3000"


def backend_url() -> str:
    """Return the public backend URL used for OAuth callback defaults."""
    configured = os.getenv("BACKEND_URL", "").strip().rstrip("/")
    if configured:
        return configured

    render_hostname = os.getenv("RENDER_EXTERNAL_HOSTNAME", "").strip()
    if render_hostname:
        return f"https://{render_hostname}"

    return "http://localhost:8000"


def cors_origins() -> list[str]:
    """Load a comma-separated CORS allowlist and keep local defaults for dev."""
    configured = os.getenv("BACKEND_CORS_ORIGINS", "").strip()
    if configured:
        return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]

    origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    }
    public_frontend = frontend_url()
    if public_frontend:
        origins.add(public_frontend)
    return sorted(origins)
