"""
Gemini API client for the AI Smart Folder Recommendation module. Kept
separate from `service.py` (orchestration) and `embedding_service.py`
(semantic ranking) so each has one job: this module's only job is "call
Gemini, get back a validated `GeminiRecommendationPayload`, or raise one of
the well-defined errors in `exceptions.py`".

Never called directly from React - the API key never leaves the server
(see `config.py`: read only from `GEMINI_API_KEY` in `.env`).
"""
import logging
from typing import Optional

import httpx

from src.ai_recommendation.config import Settings, get_settings
from src.ai_recommendation.exceptions import (
    GeminiNotConfiguredError,
    GeminiRequestError,
    GeminiTimeoutError,
    InvalidGeminiResponseError,
)
from src.ai_recommendation.schemas import GeminiRecommendationPayload
from src.ai_recommendation.utils import try_parse_json_object

logger = logging.getLogger("app.ai_recommendation")


async def _call_gemini_once(prompt: str, settings: Settings) -> str:
    # Gemini 3.x models (e.g. gemini-3.6-flash) reject/ignore legacy
    # generation-config fields - only send what's actually supported.
    # See: https://ai.google.dev/gemini-api/docs/generate-content/latest-model
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 300,
            "responseMimeType": "application/json",
        },
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": settings.gemini_api_key}

    try:
        async with httpx.AsyncClient(timeout=settings.gemini_timeout_seconds) as client:
            response = await client.post(settings.gemini_endpoint, json=payload, headers=headers)
    except httpx.TimeoutException as exc:
        raise GeminiTimeoutError(f"Gemini request timed out after {settings.gemini_timeout_seconds}s") from exc
    except httpx.HTTPError as exc:
        raise GeminiRequestError(f"Gemini request failed: {exc}") from exc

    if response.status_code == 404:
        # Clean, specific configuration error (spec Issue 1) - never crash,
        # just make it obvious the .env model name is the problem.
        raise GeminiRequestError(
            f"Configured Gemini model '{settings.gemini_model}' was not found (HTTP 404). "
            f"Check GEMINI_MODEL in your .env - it must be a currently supported Gemini model id."
        )
    if response.status_code == 401 or response.status_code == 403:
        raise GeminiRequestError(
            f"Gemini rejected the request (HTTP {response.status_code}). Check that GEMINI_API_KEY in your .env is valid."
        )
    if response.status_code == 429:
        raise GeminiRequestError("Gemini rate limit exceeded (HTTP 429)")
    if response.status_code >= 400:
        raise GeminiRequestError(f"Gemini returned HTTP {response.status_code}: {response.text[:300]}")

    try:
        body = response.json()
        return body["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise InvalidGeminiResponseError(f"Unexpected Gemini response shape: {exc}") from exc


def _validate_folder_exists(payload: GeminiRecommendationPayload, available_folder_names: set[str]) -> None:
    """Spec: Gemini must never invent folder names - only choose from the
    folders we told it exist. Case-insensitive match."""
    if payload.recommended_folder.strip().lower() not in available_folder_names:
        raise InvalidGeminiResponseError(
            f"Gemini recommended '{payload.recommended_folder}', which is not one of the user's existing folders"
        )


async def get_gemini_recommendation(
    prompt: str, *, available_folder_names: set[str], settings: Optional[Settings] = None
) -> GeminiRecommendationPayload:
    """Calls Gemini, validates STRICT JSON + folder existence, retries once
    on any failure (invalid JSON, schema mismatch, invented folder name),
    per spec. Raises an AIRecommendationError subclass on final failure -
    callers (service.py) must catch and fall back to embeddings/rules."""
    settings = settings or get_settings()

    if not settings.is_ai_enabled:
        raise GeminiNotConfiguredError("GEMINI_API_KEY is not set")

    last_error: Optional[Exception] = None
    attempts = 1 + max(0, settings.gemini_max_retries)

    for attempt in range(1, attempts + 1):
        try:
            raw_text = await _call_gemini_once(prompt, settings)
        except (GeminiTimeoutError, GeminiRequestError, InvalidGeminiResponseError) as exc:
            last_error = exc
            logger.warning("Gemini call attempt %d/%d failed: %s", attempt, attempts, exc)
            continue

        parsed = try_parse_json_object(raw_text)
        if parsed is None:
            last_error = InvalidGeminiResponseError("Gemini response was not valid JSON")
            logger.warning("Gemini attempt %d/%d returned non-JSON output", attempt, attempts)
            continue

        try:
            candidate = GeminiRecommendationPayload.model_validate(parsed)
        except Exception as exc:
            last_error = InvalidGeminiResponseError(f"Gemini JSON failed schema validation: {exc}")
            logger.warning("Gemini attempt %d/%d failed schema validation: %s", attempt, attempts, exc)
            continue

        try:
            _validate_folder_exists(candidate, available_folder_names)
        except InvalidGeminiResponseError as exc:
            last_error = exc
            logger.warning("Gemini attempt %d/%d: %s", attempt, attempts, exc)
            continue

        return candidate

    assert last_error is not None
    raise last_error
