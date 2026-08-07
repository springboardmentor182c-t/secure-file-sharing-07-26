"""
Environment-driven configuration for the AI Smart Folder Recommendation
module. Nothing here is hardcoded - every value is read from the process
environment (populated from the server's `.env` via `src.database.core`,
which already calls `load_dotenv()` on import).

The module MUST be able to import, and the app MUST be able to start, even
when `GEMINI_API_KEY` is missing or `sentence-transformers` isn't
installed - callers check `Settings.is_ai_enabled` / catch
`EmbeddingUnavailableError` and degrade gracefully instead.
"""
import os
from dataclasses import dataclass
from functools import lru_cache

# Importing this triggers `src.database.core`'s `load_dotenv()` as a side
# effect (safe/idempotent), so a standalone import of this module still
# picks up the server's .env file without duplicating the dotenv lookup
# logic here.
try:  # pragma: no cover - defensive; core always exists in this project
    import src.database.core  # noqa: F401
except Exception:  # pragma: no cover
    pass


@dataclass(frozen=True)
class Settings:
    # Gemini
    gemini_api_key: str
    gemini_model: str
    gemini_api_base: str
    gemini_timeout_seconds: float
    gemini_max_retries: int

    # Embedding engine
    embedding_model_name: str
    top_k_candidates: int

    # Document extraction / prompt sizing
    max_extract_chars: int
    summary_max_sentences: int
    keyword_top_n: int
    history_limit: int
    max_upload_read_bytes: int

    # Folder representation building (reads a bounded sample of the
    # user's own recent files per folder to enrich embeddings - never
    # unbounded, to keep this fast even for users with many folders/files)
    folder_sample_files: int
    folder_sample_max_file_bytes: int
    folder_sample_max_chars_per_file: int

    @property
    def is_ai_enabled(self) -> bool:
        return bool(self.gemini_api_key.strip())

    @property
    def gemini_endpoint(self) -> str:
        return f"{self.gemini_api_base}/models/{self.gemini_model}:generateContent"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    import logging as _logging  # local import to avoid circular at module level
    _log = _logging.getLogger("app.ai_recommendation")
    s = Settings(
        gemini_api_key=os.getenv("GEMINI_API_KEY", "").strip(),
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip(),
        gemini_api_base=os.getenv(
            "GEMINI_API_BASE", "https://generativelanguage.googleapis.com/v1beta"
        ).rstrip("/"),
        gemini_timeout_seconds=float(os.getenv("GEMINI_TIMEOUT_SECONDS", "30")),
        gemini_max_retries=int(os.getenv("GEMINI_MAX_RETRIES", "2")),
        embedding_model_name=os.getenv("AI_RECOMMENDATION_EMBEDDING_MODEL", "all-MiniLM-L6-v2"),
        top_k_candidates=int(os.getenv("AI_RECOMMENDATION_TOP_K", "3")),
        max_extract_chars=int(os.getenv("AI_RECOMMENDATION_MAX_EXTRACT_CHARS", "4000")),
        summary_max_sentences=int(os.getenv("AI_RECOMMENDATION_SUMMARY_SENTENCES", "3")),
        keyword_top_n=int(os.getenv("AI_RECOMMENDATION_KEYWORD_COUNT", "10")),
        history_limit=int(os.getenv("AI_RECOMMENDATION_HISTORY_LIMIT", "20")),
        max_upload_read_bytes=int(os.getenv("AI_RECOMMENDATION_MAX_READ_MB", "25")) * 1024 * 1024,
        folder_sample_files=int(os.getenv("AI_RECOMMENDATION_FOLDER_SAMPLE_FILES", "2")),
        folder_sample_max_file_bytes=int(os.getenv("AI_RECOMMENDATION_FOLDER_SAMPLE_MAX_MB", "2")) * 1024 * 1024,
        folder_sample_max_chars_per_file=int(os.getenv("AI_RECOMMENDATION_FOLDER_SAMPLE_MAX_CHARS", "800")),
    )
    if s.is_ai_enabled:
        _log.info(
            "AI settings loaded: model=%s endpoint=%s timeout=%.0fs retries=%d",
            s.gemini_model, s.gemini_endpoint, s.gemini_timeout_seconds, s.gemini_max_retries,
        )
    else:
        _log.warning(
            "GEMINI_API_KEY is not set - Gemini recommendations disabled; "
            "embedding/fallback will be used instead."
        )
    return s


def clear_settings_cache() -> None:
    """Purge the cached Settings object so the next call to get_settings()
    re-reads the current process environment (e.g. after os.environ has been
    updated or load_dotenv() has been re-called). Thread-safe."""
    get_settings.cache_clear()
