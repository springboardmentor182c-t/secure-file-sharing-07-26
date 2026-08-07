"""
Exception hierarchy for the AI Smart Folder Recommendation module.

These extend the project's shared `AppError` (src/exceptions.py) so any
that DO escape to the router are converted into the same standardized JSON
error envelope every other module uses. In practice, none of these should
ever reach the client - `service.py` catches every one internally and
degrades to the next tier of the pipeline (Gemini -> embeddings -> rule
based fallback) so a recommendation request always returns 200.
"""
from src.exceptions import AppError


class AIRecommendationError(AppError):
    """Base class for every error raised inside this module."""
    status_code = 500
    error_code = "ai_recommendation_error"


# --- Gemini -----------------------------------------------------------------


class GeminiNotConfiguredError(AIRecommendationError):
    """GEMINI_API_KEY is missing. Never bubbles up to the client - it's a
    signal for the service layer to skip straight to the embedding
    recommendation."""
    status_code = 503
    error_code = "ai_not_configured"


class GeminiTimeoutError(AIRecommendationError):
    status_code = 504
    error_code = "ai_timeout"


class GeminiRequestError(AIRecommendationError):
    """Network failure, rate limit, or non-2xx response from the Gemini API."""
    status_code = 502
    error_code = "ai_request_failed"


class InvalidGeminiResponseError(AIRecommendationError):
    """Gemini responded, but not with the strict JSON shape we require
    (even after one retry), or it recommended a folder that doesn't exist."""
    status_code = 502
    error_code = "ai_invalid_response"


# --- Embedding engine ---------------------------------------------------


class EmbeddingUnavailableError(AIRecommendationError):
    """Raised internally when the embedding engine can't be used for this
    request (dependency not installed, model failed to load, or there are
    no folders to compare against). Never bubbles up - the service layer
    falls back to the rule-based recommender."""
    status_code = 503
    error_code = "ai_embedding_unavailable"


# --- Content ------------------------------------------------------------


class UnsupportedContentError(AIRecommendationError):
    """Raised internally by text-extraction helpers for a file type/state
    they can't safely handle (e.g. a corrupt PDF). Never blocks the
    recommendation - callers treat this the same as "no extractable text".
    """
    status_code = 422
    error_code = "ai_unsupported_content"
