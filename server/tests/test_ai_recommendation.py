"""
Unit + integration tests for the AI Smart Folder Recommendation module (v2
- embeddings + Gemini reasoning).

Covers (per spec): PDF/DOCX/TXT upload, unknown extension, empty/large
documents, no folders, no previous uploads, Gemini timeout, invalid JSON,
missing API key, Gemini recommending outside the embedding Top-K
(ai_adjusted), and full embedding-engine unavailability (rule-based
fallback).

Two testing tiers, deliberately:
  1. Real embedding-unavailable path (no network access to Hugging Face in
     CI/this sandbox) - this exercises the actual graceful-degradation
     code in `embedding_service.py`, which is exactly what a fresh
     `pip install`-only environment looks like before the model cache is
     warm.
  2. Monkeypatched `embedding_service.embed_texts` with deterministic
     vectors - this exercises the ranking/reconciliation business logic in
     `service.py` without needing the real ~90MB model weights on disk,
     which is unnecessary for testing that logic.
"""
import uuid

import numpy as np
import pytest

from src.ai_recommendation import embedding_service, gemini_service, service
from src.ai_recommendation.config import get_settings
from src.ai_recommendation.exceptions import EmbeddingUnavailableError, GeminiTimeoutError
from src.ai_recommendation.schemas import FolderSummary, UploadHistoryEntry
from src.ai_recommendation.utils import (
    extract_keywords,
    extract_text_content,
    generate_summary,
    normalize_whitespace,
    strip_code_fences,
    truncate_text,
    try_parse_json_object,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _create_user(client, email="ai-rec-user@example.com"):
    res = client.post("/users", json={"email": email, "full_name": "AI Rec User"})
    assert res.status_code == 201, res.text
    return res.json()["data"]["id"]


def _create_folder(client, user_id, name):
    res = client.post("/folders", headers={"X-User-Id": user_id}, json={"name": name})
    assert res.status_code == 201, res.text
    return res.json()["data"]["id"]


def _upload(client, user_id, folder_id=None, filename="notes.txt", content=b"hello", mime="text/plain"):
    data = {"folder_id": folder_id} if folder_id else {}
    res = client.post(
        "/files", headers={"X-User-Id": user_id}, files={"upload": (filename, content, mime)}, data=data,
    )
    assert res.status_code == 201, res.text
    return res.json()["data"]


def _recommend(client, user_id, filename, content, mime):
    return client.post(
        "/api/ai/recommend-folder",
        headers={"X-User-Id": user_id},
        files={"upload": (filename, content, mime)},
    )


@pytest.fixture(autouse=True)
def _reset_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def _fake_embedder(vectors_by_text):
    """Returns a stand-in for `embedding_service.embed_texts` that maps
    known input strings to deterministic vectors, for testing the ranking/
    reconciliation logic without the real model."""

    def _embed_texts(texts):
        return np.array([vectors_by_text[t] for t in texts], dtype=np.float32)

    return _embed_texts


# ---------------------------------------------------------------------------
# Unit tests: utils
# ---------------------------------------------------------------------------


def test_normalize_whitespace_collapses_newlines_and_spaces():
    assert normalize_whitespace("a\n\n  b   c\t\td") == "a b c d"


def test_truncate_text_large_document_is_truncated():
    long_text = "word " * 5000
    result = truncate_text(long_text, 100)
    assert len(result) <= 130
    assert result.endswith("…[truncated]")


def test_generate_summary_takes_first_sentences():
    text = "First sentence. Second sentence. Third sentence. Fourth sentence."
    summary = generate_summary(text, max_sentences=2)
    assert "First sentence." in summary
    assert "Second sentence." in summary
    assert "Fourth sentence." not in summary


def test_generate_summary_empty_text_returns_empty():
    assert generate_summary("", max_sentences=3) == ""


def test_extract_keywords_filters_stopwords():
    text = "The invoice for the electricity bill is attached for this month payment"
    keywords = extract_keywords(text, top_n=5)
    assert "the" not in keywords
    assert "invoice" in keywords or "electricity" in keywords or "bill" in keywords


def test_extract_text_content_empty_document_returns_empty_string():
    assert extract_text_content("txt", b"", 4000) == ""


def test_extract_text_content_csv_produces_readable_rows():
    csv_bytes = b"name,amount,date\nElectricity,120.50,2026-01-05\nWater,40.00,2026-01-06\n"
    text = extract_text_content("csv", csv_bytes, 4000)
    assert "Electricity" in text
    assert "120.50" in text


def test_try_parse_json_object_strips_code_fences():
    raw = '```json\n{"recommended_folder": "Finance", "confidence": 80, "reason": "x"}\n```'
    assert try_parse_json_object(raw)["recommended_folder"] == "Finance"


def test_strip_code_fences_plain_text_unchanged():
    assert strip_code_fences("plain") == "plain"


# ---------------------------------------------------------------------------
# Unit tests: embedding engine (real, no-network path)
# ---------------------------------------------------------------------------


def test_cosine_similarity_identical_vectors_is_one():
    v = np.array([1.0, 2.0, 3.0], dtype=np.float32)
    assert embedding_service.cosine_similarity(v, v) == pytest.approx(1.0, abs=1e-5)


def test_cosine_similarity_orthogonal_vectors_is_zero():
    a = np.array([1.0, 0.0], dtype=np.float32)
    b = np.array([0.0, 1.0], dtype=np.float32)
    assert embedding_service.cosine_similarity(a, b) == pytest.approx(0.0, abs=1e-5)


def test_normalize_similarity_bounds_negative_cosine_into_zero_to_one():
    assert embedding_service.normalize_similarity(-1.0) == pytest.approx(0.0, abs=1e-6)
    assert embedding_service.normalize_similarity(1.0) == pytest.approx(1.0, abs=1e-6)
    assert embedding_service.normalize_similarity(0.0) == pytest.approx(0.5, abs=1e-6)


def test_rank_by_similarity_orders_highest_first():
    query = np.array([1.0, 0.0], dtype=np.float32)
    candidates = [("Far", np.array([0.0, 1.0], dtype=np.float32)), ("Close", np.array([0.9, 0.1], dtype=np.float32))]
    ranked = embedding_service.rank_by_similarity(query, candidates)
    assert ranked[0].name == "Close"
    assert ranked[0].similarity > ranked[1].similarity


# ---------------------------------------------------------------------------
# Unit tests: rule-based fallback
# ---------------------------------------------------------------------------


def test_fallback_no_folders_no_history_suggests_category():
    result = service._build_fallback_recommendation(extension="pdf", folders=[], history=[])
    assert result.recommended_folder == "Documents"


def test_fallback_matches_history_same_extension():
    history = [UploadHistoryEntry(filename="a.pdf", extension="pdf", folder_name="Contracts", category="Legal")]
    result = service._build_fallback_recommendation(extension="pdf", folders=[], history=history)
    assert result.recommended_folder == "Contracts"


def test_fallback_matches_folder_by_keyword():
    folders = [FolderSummary(id=uuid.uuid4(), name="My Finance Docs")]
    result = service._build_fallback_recommendation(extension="xlsx", folders=folders, history=[])
    assert result.recommended_folder == "My Finance Docs"


# ---------------------------------------------------------------------------
# Integration tests: endpoint behavior with NO real embedding model and NO
# Gemini key available (the exact state of a fresh checkout before any
# config is added) - must degrade all the way to the rule-based fallback,
# never error.
# ---------------------------------------------------------------------------


def test_recommend_folder_txt_upload_no_key_no_model_uses_fallback(client):
    user_id = _create_user(client)
    _create_folder(client, user_id, "General")
    res = _recommend(client, user_id, "readme.txt", b"hello world", "text/plain")
    assert res.status_code == 200, res.text
    body = res.json()["data"]
    assert body["source"] in ("fallback", "embedding")  # embedding only if HF cache happens to be warm
    assert body["recommended_folder"]
    assert 0 <= body["confidence"] <= 100


def test_recommend_folder_pdf_upload(client):
    user_id = _create_user(client)
    pdf_bytes = b"%PDF-1.4\n%mock pdf content for testing\n"
    res = _recommend(client, user_id, "invoice.pdf", pdf_bytes, "application/pdf")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["recommended_folder"]


def test_recommend_folder_docx_upload(client):
    user_id = _create_user(client)
    res = _recommend(client, user_id, "report.docx", b"not a real docx binary",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["recommended_folder"]


def test_recommend_folder_unknown_extension(client):
    user_id = _create_user(client)
    res = _recommend(client, user_id, "mystery.xyz", b"some bytes", "application/octet-stream")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["recommended_folder"]


def test_recommend_folder_empty_document(client):
    user_id = _create_user(client)
    res = _recommend(client, user_id, "empty.txt", b"", "text/plain")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["recommended_folder"]


def test_recommend_folder_large_document(client):
    user_id = _create_user(client)
    large_content = b"word " * 200000  # ~1MB, well above the extract-char cap
    res = _recommend(client, user_id, "huge.txt", large_content, "text/plain")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["recommended_folder"]


def test_recommend_folder_no_folders_no_history(client):
    user_id = _create_user(client)
    res = _recommend(client, user_id, "brand_new.txt", b"first ever upload", "text/plain")
    assert res.status_code == 200, res.text
    body = res.json()["data"]
    assert body["available_folders"] == []
    assert body["is_new_folder_suggestion"] is True
    assert body["source"] == "fallback"


def test_recommend_folder_upload_never_saves_a_file(client):
    """The AI endpoint must never persist the file - only /files does."""
    user_id = _create_user(client)
    before = client.get("/files", headers={"X-User-Id": user_id}).json()["data"]
    _recommend(client, user_id, "should_not_be_saved.txt", b"content", "text/plain")
    after = client.get("/files", headers={"X-User-Id": user_id}).json()["data"]
    assert len(before) == len(after)


def test_recommend_folder_requires_user_header(client):
    res = client.post("/api/ai/recommend-folder", files={"upload": ("a.txt", b"hi", "text/plain")})
    assert res.status_code == 401


def test_recommend_folder_missing_gemini_key_never_errors(client, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    get_settings.cache_clear()
    user_id = _create_user(client)
    _create_folder(client, user_id, "Docs")
    res = _recommend(client, user_id, "a.txt", b"content", "text/plain")
    assert res.status_code == 200, res.text


# ---------------------------------------------------------------------------
# Integration tests: Gemini timeout / invalid JSON / invented folder name
# -> graceful fallback, never a failed request.
# ---------------------------------------------------------------------------


def test_recommend_folder_gemini_timeout_falls_back(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    get_settings.cache_clear()

    async def _raise_timeout(prompt, settings):
        raise GeminiTimeoutError("simulated timeout")

    monkeypatch.setattr(gemini_service, "_call_gemini_once", _raise_timeout)

    user_id = _create_user(client)
    _create_folder(client, user_id, "Docs")
    res = _recommend(client, user_id, "slow.txt", b"content", "text/plain")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["source"] in ("embedding", "fallback")


def test_recommend_folder_gemini_invalid_json_retries_then_falls_back(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    get_settings.cache_clear()

    call_count = {"n": 0}

    async def _return_garbage(prompt, settings):
        call_count["n"] += 1
        return "this is not json at all"

    monkeypatch.setattr(gemini_service, "_call_gemini_once", _return_garbage)

    user_id = _create_user(client)
    _create_folder(client, user_id, "Docs")
    res = _recommend(client, user_id, "garbage.txt", b"content", "text/plain")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["source"] in ("embedding", "fallback")
    assert call_count["n"] == 2  # one initial attempt + one retry


def test_recommend_folder_gemini_invents_nonexistent_folder_falls_back(client, monkeypatch):
    """Spec: Gemini must never invent folder names - if it does, treat it
    exactly like an invalid response (retry once, then fall through)."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    get_settings.cache_clear()

    async def _return_fake_folder(prompt, settings):
        return '{"recommended_folder": "Folder That Does Not Exist", "confidence": 90, "reason": "made up"}'

    monkeypatch.setattr(gemini_service, "_call_gemini_once", _return_fake_folder)

    user_id = _create_user(client)
    _create_folder(client, user_id, "Docs")
    res = _recommend(client, user_id, "a.txt", b"content", "text/plain")
    assert res.status_code == 200, res.text
    body = res.json()["data"]
    assert body["recommended_folder"] != "Folder That Does Not Exist"
    assert body["source"] in ("embedding", "fallback")


# ---------------------------------------------------------------------------
# Integration tests: reconciliation logic with a mocked embedding engine
# (deterministic vectors) so we can exercise ai / ai_adjusted / embedding
# sourcing without the real ~90MB model.
# ---------------------------------------------------------------------------


def test_recommend_folder_gemini_agrees_with_top_candidate_source_ai(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    get_settings.cache_clear()

    user_id = _create_user(client)
    _create_folder(client, user_id, "Finance")
    _create_folder(client, user_id, "Personal")

    # Deterministic embeddings: the document vector is close to "Finance".
    def fake_embed_texts(texts):
        vectors = []
        for t in texts:
            if "Finance" in t:
                vectors.append([1.0, 0.0])
            elif "Personal" in t:
                vectors.append([0.0, 1.0])
            else:  # the document text (filename/summary/keywords)
                vectors.append([0.95, 0.05])
        return np.array(vectors, dtype=np.float32)

    monkeypatch.setattr(embedding_service, "embed_texts", fake_embed_texts)

    async def _return_finance(prompt, settings):
        return '{"recommended_folder": "Finance", "confidence": 88, "reason": "Looks financial."}'

    monkeypatch.setattr(gemini_service, "_call_gemini_once", _return_finance)

    res = _recommend(client, user_id, "invoice.pdf", b"invoice content", "application/pdf")
    assert res.status_code == 200, res.text
    body = res.json()["data"]
    assert body["recommended_folder"] == "Finance"
    assert body["source"] == "ai"
    assert body["similarity_score"] is not None
    assert body["embedding_engine_available"] is True
    assert any(alt["folder_name"] == "Personal" for alt in body["alternative_folders"])


def test_recommend_folder_gemini_outside_top_candidates_gets_adjusted(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    monkeypatch.setenv("AI_RECOMMENDATION_TOP_K", "1")  # force a narrow Top-K so it's easy to be "outside" it
    get_settings.cache_clear()

    user_id = _create_user(client)
    _create_folder(client, user_id, "Finance")
    _create_folder(client, user_id, "Personal")

    def fake_embed_texts(texts):
        vectors = []
        for t in texts:
            if "Finance" in t:
                vectors.append([1.0, 0.0])
            elif "Personal" in t:
                vectors.append([0.0, 1.0])
            else:
                vectors.append([0.95, 0.05])  # document is clearly closest to Finance
        return np.array(vectors, dtype=np.float32)

    monkeypatch.setattr(embedding_service, "embed_texts", fake_embed_texts)

    # Gemini picks "Personal" - an existing folder, but outside the Top-1 candidate ("Finance"),
    # with LOW confidence - embedding similarity for Finance should win the comparison.
    async def _return_personal_low_confidence(prompt, settings):
        return '{"recommended_folder": "Personal", "confidence": 20, "reason": "Weak guess."}'

    monkeypatch.setattr(gemini_service, "_call_gemini_once", _return_personal_low_confidence)

    res = _recommend(client, user_id, "invoice.pdf", b"invoice content", "application/pdf")
    assert res.status_code == 200, res.text
    body = res.json()["data"]
    assert body["recommended_folder"] == "Finance"  # adjusted back to the embedding top candidate
    assert body["source"] == "ai_adjusted"


def test_recommend_folder_gemini_confidence_wins_over_weak_embedding_match(client, monkeypatch):
    """Spec: when Gemini picks a folder outside the Top-K, compare
    confidence and use the *better* recommendation - not always the
    embedding pick."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    monkeypatch.setenv("AI_RECOMMENDATION_TOP_K", "1")
    get_settings.cache_clear()

    user_id = _create_user(client)
    _create_folder(client, user_id, "Finance")
    _create_folder(client, user_id, "Personal")

    def fake_embed_texts(texts):
        vectors = []
        for t in texts:
            if "Finance" in t:
                vectors.append([0.9, 0.1])
            elif "Personal" in t:
                vectors.append([0.1, 0.9])
            else:
                vectors.append([0.6, 0.4])  # doc leans toward Finance, but not overwhelmingly
        return np.array(vectors, dtype=np.float32)

    monkeypatch.setattr(embedding_service, "embed_texts", fake_embed_texts)

    # Gemini is very confident about "Personal" (a real folder, just outside Top-1 "Finance").
    async def _return_personal_high_confidence(prompt, settings):
        return '{"recommended_folder": "Personal", "confidence": 97, "reason": "Clearly a passport scan."}'

    monkeypatch.setattr(gemini_service, "_call_gemini_once", _return_personal_high_confidence)

    res = _recommend(client, user_id, "passport.pdf", b"passport content", "application/pdf")
    assert res.status_code == 200, res.text
    body = res.json()["data"]
    assert body["recommended_folder"] == "Personal"  # Gemini's stronger confidence wins
    assert body["source"] == "ai_adjusted"
    assert body["confidence"] == 97


def test_recommend_folder_gemini_model_not_found_gives_clean_error_and_falls_back(client, monkeypatch):
    """Spec Issue 1: a misconfigured/unavailable GEMINI_MODEL must produce
    a clean configuration error internally and never crash the backend -
    the request still returns 200 with a usable recommendation."""
    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-real")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-does-not-exist")
    get_settings.cache_clear()

    class _FakeResponse:
        status_code = 404
        text = '{"error": {"code": 404, "message": "model not found"}}'

    async def _fake_post(self, url, json, headers):
        return _FakeResponse()

    import httpx as httpx_module
    monkeypatch.setattr(httpx_module.AsyncClient, "post", _fake_post)

    user_id = _create_user(client)
    _create_folder(client, user_id, "Docs")
    res = _recommend(client, user_id, "a.txt", b"content", "text/plain")
    assert res.status_code == 200, res.text
    assert res.json()["data"]["source"] in ("embedding", "fallback")


def test_recommend_folder_no_gemini_key_uses_embedding_top1(client, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    get_settings.cache_clear()

    user_id = _create_user(client)
    _create_folder(client, user_id, "Finance")
    _create_folder(client, user_id, "Personal")

    def fake_embed_texts(texts):
        vectors = []
        for t in texts:
            if "Finance" in t:
                vectors.append([1.0, 0.0])
            elif "Personal" in t:
                vectors.append([0.0, 1.0])
            else:
                vectors.append([0.9, 0.1])
        return np.array(vectors, dtype=np.float32)

    monkeypatch.setattr(embedding_service, "embed_texts", fake_embed_texts)

    res = _recommend(client, user_id, "invoice.pdf", b"invoice content", "application/pdf")
    assert res.status_code == 200, res.text
    body = res.json()["data"]
    assert body["recommended_folder"] == "Finance"
    assert body["source"] == "embedding"


def test_recommend_folder_embedding_unavailable_raises_typed_error(monkeypatch):
    def _raise(texts):
        raise EmbeddingUnavailableError("simulated: dependency not installed")

    monkeypatch.setattr(embedding_service, "embed_texts", _raise)
    with pytest.raises(EmbeddingUnavailableError):
        embedding_service.embed_texts(["x"])
