"""
Tests for the AI Smart Folder Recommendation module.

Grok and the local embedding model are mocked (via monkeypatch) rather than
hitting the real xAI API or loading a real sentence-transformers model, so
this suite is fast, deterministic, and needs no network access or API key.
It exercises the module through the real HTTP endpoint + real SQLite-backed
folders/files, using the same `client`/`db_session` fixtures as the rest of
the project's test suite (see tests/conftest.py).
"""
import uuid

import pytest

from src.ai_recommendation import service as ai_service
from src.ai_recommendation.exceptions import EmbeddingUnavailableError, GrokUnavailableError
from src.ai_recommendation.schemas import RawGrokRecommendation


# ---------------------------------------------------------------------------
# Fixtures & Helpers
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def mock_embedding_model(monkeypatch):
    """Mock the sentence-transformers model so unit tests are instant and don't load external weights."""
    class DummyModel:
        def encode(self, texts, normalize_embeddings=True):
            import numpy as np
            vecs = []
            for t in texts:
                seed = abs(hash(t)) % (2**32)
                rng = np.random.RandomState(seed)
                v = rng.randn(384)
                if normalize_embeddings:
                    norm = np.linalg.norm(v) or 1.0
                    v = v / norm
                vecs.append(v)
            return np.array(vecs)

    dummy = DummyModel()
    monkeypatch.setattr("src.ai_recommendation.embedding_service._get_model", lambda: dummy)
    monkeypatch.setattr("src.ai_recommendation.folder_manager._get_model", lambda: dummy)


def _create_user(client, email="ai-test@example.com"):
    res = client.post("/users", json={"email": email, "full_name": "AI Test User"})
    assert res.status_code == 201, res.text
    return res.json()["data"]["id"]


def _create_folder(client, user_id, name):
    res = client.post("/folders", headers={"X-User-Id": user_id}, json={"name": name, "parent_id": None})
    assert res.status_code == 201, res.text
    return res.json()["data"]["id"]


def _upload_file(client, user_id, folder_id, filename, content, content_type="text/plain"):
    res = client.post(
        "/files",
        headers={"X-User-Id": user_id},
        data={"folder_id": folder_id} if folder_id else {},
        files={"upload": (filename, content, content_type)},
    )
    assert res.status_code == 201, res.text
    return res.json()["data"]


def _recommend(client, user_id, filename, content, content_type="text/plain"):
    return client.post(
        "/api/ai/recommend-folder",
        headers={"X-User-Id": user_id},
        files={"upload": (filename, content, content_type)},
    )


# ---------------------------------------------------------------------------
# 1. Grok success (existing folder match)
# ---------------------------------------------------------------------------


def test_grok_success_returns_grok_source(client, monkeypatch):
    user_id = _create_user(client)
    career_id = _create_folder(client, user_id, "Career")
    _create_folder(client, user_id, "Finance")

    def fake_grok(**kwargs):
        return {"category_name": "Career", "recommended_folder_id": career_id, "confidence": 0.95, "reason": "Resume content."}

    monkeypatch.setattr(ai_service.grok_service, "get_grok_recommendation", fake_grok)

    res = _recommend(client, user_id, "resume.txt", b"Education, skills, experience")
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["source"] == "grok"
    assert data["recommendation_type"] == "EXISTING_FOLDER"
    assert data["recommended_folder_id"] == career_id
    assert data["confidence"] == pytest.approx(0.95)


# ---------------------------------------------------------------------------
# 2. Grok creates new folder when no suitable existing folder exists
# ---------------------------------------------------------------------------


def test_grok_creates_new_folder_when_no_match(client, monkeypatch):
    user_id = _create_user(client)
    _create_folder(client, user_id, "Finance")

    def fake_grok(**kwargs):
        return {"category_name": "Machine Learning Research", "recommended_folder_id": None, "confidence": 0.91, "reason": "Research document."}

    monkeypatch.setattr(ai_service.grok_service, "get_grok_recommendation", fake_grok)

    res = _recommend(client, user_id, "ml_paper.txt", b"Deep neural networks and transformer architecture research.")
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["source"] == "grok"
    assert data["recommendation_type"] == "NEW_FOLDER"
    assert data["recommended_folder_name"] == "Machine Learning Research"
    assert data["recommended_folder_id"] is not None
    # Validate created folder exists in user's folders in database
    folders_res = client.get("/folders", headers={"X-User-Id": user_id})
    folder_names = [f["name"] for f in folders_res.json()["data"]]
    assert "Machine Learning Research" in folder_names



# ---------------------------------------------------------------------------
# 3. Grok failure -> embedding executes
# ---------------------------------------------------------------------------


def test_grok_failure_falls_through_to_embedding(client, monkeypatch):
    user_id = _create_user(client)
    career_id = _create_folder(client, user_id, "Career")

    def failing_grok(**kwargs):
        raise GrokUnavailableError("HTTP 401")

    def fake_embedding(**kwargs):
        return RawGrokRecommendation(recommended_folder_id=career_id, confidence=0.7, reason="Semantic match.")

    monkeypatch.setattr(ai_service.grok_service, "get_grok_recommendation", failing_grok)
    monkeypatch.setattr(ai_service.embedding_service, "get_embedding_recommendation", fake_embedding)

    res = _recommend(client, user_id, "resume.txt", b"Education, skills, experience")
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["source"] == "embedding"
    assert data["recommendation_type"] == "EXISTING_FOLDER"
    assert data["recommended_folder_id"] == career_id


# ---------------------------------------------------------------------------
# 4. Embedding success (explicit variant)
# ---------------------------------------------------------------------------


def test_embedding_finds_correct_folder_after_grok_fails(client, monkeypatch):
    user_id = _create_user(client)
    _create_folder(client, user_id, "Finance")
    career_id = _create_folder(client, user_id, "Career")

    monkeypatch.setattr(
        ai_service.grok_service, "get_grok_recommendation",
        lambda **kw: (_ for _ in ()).throw(GrokUnavailableError("timeout")),
    )
    monkeypatch.setattr(
        ai_service.embedding_service, "get_embedding_recommendation",
        lambda **kw: RawGrokRecommendation(recommended_folder_id=career_id, confidence=0.81, reason="ok"),
    )

    res = _recommend(client, user_id, "cv.txt", b"resume content")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["source"] == "embedding"
    assert data["recommended_folder_id"] == career_id
    assert 0.0 <= data["confidence"] <= 1.0


# ---------------------------------------------------------------------------
# 5. Both fail -> fallback executes
# ---------------------------------------------------------------------------


def test_both_fail_uses_fallback(client, monkeypatch):
    user_id = _create_user(client)
    folder_id = _create_folder(client, user_id, "Career")
    _upload_file(client, user_id, folder_id, "existing.txt", b"hi")

    monkeypatch.setattr(
        ai_service.grok_service, "get_grok_recommendation",
        lambda **kw: (_ for _ in ()).throw(GrokUnavailableError("down")),
    )
    monkeypatch.setattr(
        ai_service.embedding_service, "get_embedding_recommendation",
        lambda **kw: (_ for _ in ()).throw(EmbeddingUnavailableError("not installed")),
    )

    res = _recommend(client, user_id, "resume.txt", b"content")
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["source"] == "fallback"
    assert data["recommendation_type"] == "EXISTING_FOLDER"
    # Fallback must recommend a real, existing folder - never invent one.
    assert data["recommended_folder_id"] == folder_id


# ---------------------------------------------------------------------------
# 6. Reuses semantically similar folder ("Career" vs "Resume")
# ---------------------------------------------------------------------------


def test_similar_existing_folder_reused_no_duplicate(client, monkeypatch):
    user_id = _create_user(client)
    career_id = _create_folder(client, user_id, "Career")

    def fake_grok(**kwargs):
        return {"category_name": "Career", "recommended_folder_id": None, "confidence": 0.95, "reason": "Resume document."}

    monkeypatch.setattr(ai_service.grok_service, "get_grok_recommendation", fake_grok)

    res = _recommend(client, user_id, "John_Doe_Resume.pdf", b"Work experience and education")
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["recommendation_type"] == "EXISTING_FOLDER"
    assert data["recommended_folder_id"] == career_id
    assert data["recommended_folder_name"] == "Career"


# ---------------------------------------------------------------------------
# 7. Unauthorized folder (Grok recommends another user's folder)
# ---------------------------------------------------------------------------


def test_grok_recommends_other_users_folder_rejected(client, monkeypatch):
    user_id = _create_user(client, email="user-a@example.com")
    other_user_id = _create_user(client, email="user-b@example.com")
    other_folder_id = _create_folder(client, other_user_id, "SomeoneElsesFolder")
    my_folder_id = _create_folder(client, user_id, "MyFolder")

    monkeypatch.setattr(
        ai_service.grok_service, "get_grok_recommendation",
        lambda **kw: {"category_name": "MyFolder", "recommended_folder_id": other_folder_id, "confidence": 0.9, "reason": "oops"},
    )
    monkeypatch.setattr(
        ai_service.embedding_service, "get_embedding_recommendation",
        lambda **kw: (_ for _ in ()).throw(EmbeddingUnavailableError("skip")),
    )

    res = _recommend(client, user_id, "resume.txt", b"content")
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["recommended_folder_id"] != other_folder_id
    assert data["recommended_folder_id"] == my_folder_id


# ---------------------------------------------------------------------------
# 8. Large document doesn't crash the endpoint
# ---------------------------------------------------------------------------


def test_large_document_does_not_crash(client, monkeypatch):
    user_id = _create_user(client)
    folder_id = _create_folder(client, user_id, "Docs")

    monkeypatch.setattr(
        ai_service.grok_service, "get_grok_recommendation",
        lambda **kw: {"category_name": "Docs", "recommended_folder_id": folder_id, "confidence": 0.5, "reason": "ok"},
    )

    huge_content = (b"lorem ipsum " * 200_000)  # ~2.4MB of text
    res = _recommend(client, user_id, "huge.txt", huge_content)
    assert res.status_code == 200, res.text
    assert res.json()["data"]["source"] == "grok"


# ---------------------------------------------------------------------------
# 9. Extraction unit tests
# ---------------------------------------------------------------------------


def test_extract_text_content_for_txt():
    from src.ai_recommendation.utils import extract_text_content

    text = extract_text_content(
        filename="notes.txt", extension="txt", mime_type="text/plain", contents=b"hello world",
    )
    assert text == "hello world"


def test_extract_text_content_unsupported_returns_empty():
    from src.ai_recommendation.utils import extract_text_content

    text = extract_text_content(
        filename="movie.mkv", extension="mkv", mime_type="video/x-matroska", contents=b"\x00\x01\x02",
    )
    assert text == ""


def test_extract_text_content_truncates_long_input():
    from src.ai_recommendation.config import AI_MAX_CONTENT_CHARS
    from src.ai_recommendation.utils import extract_text_content

    long_text = ("a" * (AI_MAX_CONTENT_CHARS * 3)).encode()
    text = extract_text_content(filename="big.txt", extension="txt", mime_type="text/plain", contents=long_text)
    assert len(text) <= AI_MAX_CONTENT_CHARS + len("\n...[truncated]...\n")

