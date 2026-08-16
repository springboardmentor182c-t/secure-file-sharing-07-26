"""
xAI (Grok) integration - primary recommendation method.

Uses the OpenAI-compatible chat completions surface of the official xAI API
(https://api.x.ai/v1), which is what `XAI_BASE_URL` points at by default.
Never raises upstream errors to the caller as-is: every failure mode is
normalized into `GrokUnavailableError` so `service.py` can fall through to
embeddings without leaking API details to the user.
"""
import json
import logging
import uuid

import requests

from src.ai_recommendation.config import (
    AI_RECOMMENDATION_TIMEOUT_SECONDS,
    XAI_API_KEY,
    XAI_BASE_URL,
    XAI_MODEL,
    grok_configured,
)
from src.ai_recommendation.exceptions import GrokUnavailableError
from src.ai_recommendation.prompt_builder import SYSTEM_PROMPT, build_user_prompt
from src.ai_recommendation.schemas import RawGrokRecommendation

logger = logging.getLogger("app.ai_recommendation")


def get_grok_recommendation(
    *,
    filename: str,
    extension: str,
    mime_type: str,
    size: int,
    extracted_content: str,
    folders: list[dict],
    history: list[dict],
) -> dict:
    """Calls Grok and returns a candidate recommendation payload with category_name and optional folder id."""
    if not grok_configured():
        raise GrokUnavailableError("XAI_API_KEY is not configured")

    user_prompt = build_user_prompt(
        filename=filename, extension=extension, mime_type=mime_type, size=size,
        extracted_content=extracted_content, folders=folders, history=history,
    )

    payload = {
        "model": XAI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }

    try:
        response = requests.post(
            f"{XAI_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=AI_RECOMMENDATION_TIMEOUT_SECONDS,
        )
    except requests.Timeout as exc:
        raise GrokUnavailableError("Grok request timed out") from exc
    except requests.RequestException as exc:
        raise GrokUnavailableError(f"Grok network error: {exc}") from exc

    if response.status_code != 200:
        logger.debug("Grok request failed: HTTP %s", response.status_code)
        raise GrokUnavailableError(f"Grok HTTP {response.status_code}")

    try:
        body = response.json()
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, ValueError, json.JSONDecodeError) as exc:
        raise GrokUnavailableError(f"Grok returned an unexpected response shape: {exc}") from exc

    if not content or not content.strip():
        raise GrokUnavailableError("Grok returned an empty response")

    parsed = _parse_json_content(content)

    category_name = parsed.get("category_name") or parsed.get("recommended_folder_name") or ""
    folder_id = parsed.get("recommended_folder_id")
    confidence = float(parsed.get("confidence", 0.8))
    reason = str(parsed.get("reason", ""))

    if folder_id:
        try:
            uuid.UUID(str(folder_id))
        except ValueError:
            folder_id = None

    return {
        "category_name": category_name,
        "recommended_folder_id": str(folder_id) if folder_id else None,
        "confidence": max(0.0, min(1.0, confidence)),
        "reason": reason,
    }



def _parse_json_content(content: str) -> dict:
    text = content.strip()
    # Defensive: strip markdown code fences if the model added them despite
    # the JSON response_format request.
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise GrokUnavailableError(f"Grok returned malformed JSON: {exc}") from exc
