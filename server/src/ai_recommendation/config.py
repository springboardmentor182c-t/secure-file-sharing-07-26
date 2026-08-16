"""
Configuration for the AI Smart Folder Recommendation module.

Everything is read from environment variables (via the project's existing
`.env` loading in `src.database.core`, which already calls `load_dotenv`
before any module-level code here runs) so this module never needs its own
dotenv wiring or a separate config system.
"""
import os
import pathlib
from typing import Optional

from dotenv import load_dotenv


def _find_dotenv() -> Optional[pathlib.Path]:
    candidates = [
        pathlib.Path(__file__).resolve().parents[2] / ".env",
        pathlib.Path.cwd() / ".env",
        pathlib.Path(__file__).resolve().parent.parent.parent / ".env",
    ]
    for path in candidates:
        if path.exists():
            return path
    return None


dotenv_path = _find_dotenv()
if dotenv_path is not None:
    load_dotenv(dotenv_path)


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or not value.strip():
        return default
    try:
        return int(value)
    except ValueError:
        return default


# ---------------------------------------------------------------------------
# Feature flag
# ---------------------------------------------------------------------------
AI_RECOMMENDATION_ENABLED = _env_bool("AI_RECOMMENDATION_ENABLED", True)

# ---------------------------------------------------------------------------
# Grok (xAI) - primary method
# ---------------------------------------------------------------------------
XAI_API_KEY = os.getenv("XAI_API_KEY", "").strip()
XAI_MODEL = os.getenv("XAI_MODEL", "grok-4.5").strip() or "grok-4.5"
XAI_BASE_URL = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1").strip().rstrip("/")
AI_RECOMMENDATION_TIMEOUT_SECONDS = _env_int("AI_RECOMMENDATION_TIMEOUT_SECONDS", 15)

# ---------------------------------------------------------------------------
# Local embeddings - second method
# ---------------------------------------------------------------------------
AI_EMBEDDING_MODEL = os.getenv("AI_EMBEDDING_MODEL", "all-MiniLM-L6-v2").strip() or "all-MiniLM-L6-v2"
# Below this cosine-similarity score, the embedding method is considered to
# not have found a confident match and the deterministic fallback is used.
AI_EMBEDDING_MIN_SIMILARITY = float(os.getenv("AI_EMBEDDING_MIN_SIMILARITY", "0.20"))

# ---------------------------------------------------------------------------
# Adaptive folder creation - new
# ---------------------------------------------------------------------------
# Minimum cosine similarity between the AI-suggested category and an existing
# folder for that folder to be reused. If no folder reaches this threshold a
# new folder is created automatically.
AI_FOLDER_SIMILARITY_THRESHOLD = float(os.getenv("AI_FOLDER_SIMILARITY_THRESHOLD", "0.50"))

# Set to False to disable automatic folder creation by the AI recommendation
# (the system will then always pick the closest existing folder or fallback).
AI_AUTO_CREATE_FOLDERS = _env_bool("AI_AUTO_CREATE_FOLDERS", True)

# ---------------------------------------------------------------------------
# Content extraction limits
# ---------------------------------------------------------------------------
AI_MAX_CONTENT_CHARS = _env_int("AI_MAX_CONTENT_CHARS", 12000)

# How many of the user's most recent files to consider as "previous
# activity" signal (real data only - see history.py).
AI_HISTORY_SAMPLE_SIZE = _env_int("AI_HISTORY_SAMPLE_SIZE", 50)

# How many existing files per folder to sample when building folder context
# from real filenames (see prompt_builder.py / embedding_service.py).
AI_FOLDER_CONTEXT_FILE_SAMPLE = _env_int("AI_FOLDER_CONTEXT_FILE_SAMPLE", 12)


def grok_configured() -> bool:
    return bool(XAI_API_KEY)
