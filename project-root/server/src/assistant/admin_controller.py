"""
Assistant Admin Controller — TrustShare AI Assistant

Admin-only endpoints for managing AI assistant configuration.
"""

import logging
import time
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.auth.dependencies import require_admin
from src.database.core import get_db
from src.entities.user import User

from src.assistant import config_service
from src.assistant.encryption_helper import decrypt_config_value
from src.assistant.models import (
    BulkUpdateConfigsRequest,
    ConfigCategoryOut,
    ConfigItemOut,
    ConfigUpdateResult,
    TestConnectionRequest,
    TestConnectionResponse,
    UpdateConfigRequest,
)

logger = logging.getLogger(__name__)
router = APIRouter()

CATEGORIES = ["llm", "rate_limit", "ui", "system"]


@router.get("/config", response_model=list[ConfigCategoryOut])
def get_all_configs(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = []
    for cat in CATEGORIES:
        items = config_service.get_all_by_category(db, cat)
        if items:
            result.append(ConfigCategoryOut(category=cat, items=items))
    return result


@router.get("/config/{category}", response_model=list[ConfigItemOut])
def get_configs_by_category(
    category: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if category not in CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown category: {category}",
        )
    return config_service.get_all_by_category(db, category)


@router.put("/config/{key}", response_model=ConfigUpdateResult)
def update_config(
    key: str,
    body: UpdateConfigRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    try:
        config_service.set_value(db, key, body.value)
        return ConfigUpdateResult(
            status="success",
            message=f"Config '{key}' updated successfully",
            updated_key=key,
            updated_count=1,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Config update failed for {key}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update config",
        )


@router.post("/config/bulk", response_model=ConfigUpdateResult)
def bulk_update_configs(
    body: BulkUpdateConfigsRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    errors = []
    success = 0

    for key, value in body.updates.items():
        try:
            config_service.set_value(db, key, value)
            success += 1
        except ValueError as e:
            errors.append(f"{key}: {e}")
        except Exception as e:
            logger.error(f"Bulk update failed for {key}: {e}")
            errors.append(f"{key}: internal error")

    if errors and success == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "All updates failed", "errors": errors},
        )

    return ConfigUpdateResult(
        status="success" if not errors else "partial",
        message=f"Updated {success} configs"
        + (f", {len(errors)} failed" if errors else ""),
        updated_count=success,
    )


@router.post("/test-connection", response_model=TestConnectionResponse)
def test_connection(
    body: TestConnectionRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Test connection to the LLM provider."""
    provider = config_service.get_str(db, "LLM_PROVIDER", "groq")
    base_url = config_service.get_str(
        db, "LLM_BASE_URL", "https://api.groq.com/openai/v1"
    )
    timeout = config_service.get_int(db, "LLM_TIMEOUT_SECONDS", 30)

    if body.api_key:
        api_key = body.api_key.strip()
    else:
        api_key = config_service.get(db, "LLM_API_KEY")

    if not api_key:
        return TestConnectionResponse(
            success=False,
            message="No API key configured. Save an API key first, or provide one to test.",
            error_type="no_api_key",
        )

    model = body.model or config_service.get_str(
        db, "LLM_MODEL", "llama-3.3-70b-versatile"
    )

    test_message = config_service.get_str(
        db, "LLM_TEST_MESSAGE", "Reply with exactly: OK"
    )
    test_system_message = config_service.get_str(
        db, "LLM_TEST_SYSTEM_MESSAGE", "You are a test bot."
    )
    test_max_tokens = config_service.get_int(db, "LLM_TEST_MAX_TOKENS", 5)

    start = time.time()
    try:
        response = httpx.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": test_system_message},
                    {"role": "user", "content": test_message},
                ],
                "max_tokens": test_max_tokens,
                "temperature": 0,
            },
            timeout=timeout,
        )

        elapsed_ms = int((time.time() - start) * 1000)

        # Log the response for debugging
        logger.info(f"[TEST-CONNECTION] Status: {response.status_code}")
        logger.info(f"[TEST-CONNECTION] Body: {response.text[:300]}")

        if response.status_code == 200:
            data = response.json()
            model_used = data.get("model", model)
            return TestConnectionResponse(
                success=True,
                message=f"Connected successfully! Provider: {provider}",
                model_used=model_used,
                response_time_ms=elapsed_ms,
            )

        error_detail = response.text[:200] if response.text else "Unknown error"

        if response.status_code == 401:
            return TestConnectionResponse(
                success=False,
                message="Invalid API key. Please check your key and try again.",
                error_type="invalid_api_key",
                response_time_ms=elapsed_ms,
            )
        elif response.status_code == 404:
            return TestConnectionResponse(
                success=False,
                message=f"Model '{model}' not found. Check model name.",
                error_type="model_not_found",
                response_time_ms=elapsed_ms,
            )
        elif response.status_code == 429:
            return TestConnectionResponse(
                success=False,
                message=f"Rate limit exceeded on the LLM provider. Details: {error_detail}",
                error_type="rate_limited",
                response_time_ms=elapsed_ms,
            )
        else:
            return TestConnectionResponse(
                success=False,
                message=f"API returned {response.status_code}: {error_detail}",
                error_type=f"http_{response.status_code}",
                response_time_ms=elapsed_ms,
            )

    except httpx.ConnectError:
        return TestConnectionResponse(
            success=False,
            message="Cannot reach LLM provider. Check your internet or base URL.",
            error_type="connection_error",
        )
    except httpx.TimeoutException:
        return TestConnectionResponse(
            success=False,
            message=f"Request timed out after {timeout}s. Try a smaller model or increase timeout.",
            error_type="timeout",
        )
    except Exception as e:
        logger.error(f"Connection test failed: {e}", exc_info=True)
        return TestConnectionResponse(
            success=False,
            message=f"Unexpected error: {type(e).__name__}",
            error_type="unknown",
        )


@router.post("/cache/clear")
def clear_cache(
    _admin: User = Depends(require_admin),
):
    config_service.clear_cache()
    return {"status": "success", "message": "Cache cleared"}


@router.get("/models")
def get_available_models(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    models = config_service.get(db, "LLM_AVAILABLE_MODELS")
    if not models or not isinstance(models, list):
        return [
            {
                "value": "llama-3.3-70b-versatile",
                "label": "Llama 3.3 70B (Recommended)",
            },
        ]
    return models


@router.get("/providers")
def get_available_providers(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    providers = config_service.get(db, "LLM_AVAILABLE_PROVIDERS")
    if not providers or not isinstance(providers, list):
        return [
            {
                "value": "groq",
                "label": "Groq (Cloud, Fast)",
                "base_url": "https://api.groq.com/openai/v1",
                "requires_key": True,
                "description": "Free tier: 100K tokens/day per model",
            }
        ]
    return providers


@router.get("/models/{provider}")
def get_models_for_provider(
    provider: str,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    all_models = config_service.get(db, "LLM_MODELS_BY_PROVIDER")
    if not all_models or not isinstance(all_models, dict):
        return []
    return all_models.get(provider, [])


@router.post("/switch-provider")
def switch_provider(
    body: dict,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    new_provider = (body.get("provider") or "").strip().lower()
    new_model = body.get("model")
    new_api_key = body.get("api_key")

    if not new_provider:
        raise HTTPException(status_code=400, detail="'provider' is required")

    providers = config_service.get(db, "LLM_AVAILABLE_PROVIDERS") or []
    provider_config = next(
        (p for p in providers if p.get("value") == new_provider), None
    )

    if not provider_config:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown provider '{new_provider}'. Available: {[p['value'] for p in providers]}",
        )

    if not new_model:
        all_models = config_service.get(db, "LLM_MODELS_BY_PROVIDER") or {}
        provider_models = all_models.get(new_provider, [])
        if provider_models:
            new_model = provider_models[0].get("value")

    if not new_model:
        raise HTTPException(
            status_code=400,
            detail=f"No default model available for '{new_provider}'",
        )

    try:
        config_service.set_value(db, "LLM_PROVIDER", new_provider)
        config_service.set_value(
            db, "LLM_BASE_URL", provider_config.get("base_url", "")
        )
        config_service.set_value(db, "LLM_MODEL", new_model)

        if new_api_key:
            config_service.set_value(db, "LLM_API_KEY", new_api_key)

        return {
            "status": "success",
            "message": f"Switched to {provider_config.get('label', new_provider)}",
            "provider": new_provider,
            "model": new_model,
            "base_url": provider_config.get("base_url"),
            "requires_key": provider_config.get("requires_key", True),
        }
    except Exception as e:
        logger.error(f"Provider switch failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Provider switch failed: {str(e)}")
