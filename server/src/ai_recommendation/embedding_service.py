"""
Semantic embedding engine for the AI Smart Folder Recommendation module.

Uses a pretrained `sentence-transformers` model (default: all-MiniLM-L6-v2)
- no custom training, per spec. The model is loaded once per process
(module-level singleton) since loading it is the expensive part; encoding
after that is fast (a few ms per short text on CPU).

This module is intentionally import-safe even when `sentence-transformers`
is not installed: `get_embedder()` raises `EmbeddingUnavailableError`
instead of an `ImportError`, so `service.py` can catch one exception type
and fall back to the rule-based recommender without crashing the app.
"""
import logging
import threading
from dataclasses import dataclass
from typing import List, Sequence, Tuple

import numpy as np

from src.ai_recommendation.config import get_settings
from src.ai_recommendation.exceptions import EmbeddingUnavailableError

logger = logging.getLogger("app.ai_recommendation")

_model = None
_model_lock = threading.Lock()
_load_failed = False  # sticky - if the model failed to load once (e.g. dependency
                       # missing), don't retry on every single request.


def _load_model():
    global _model, _load_failed
    if _model is not None:
        return _model
    if _load_failed:
        raise EmbeddingUnavailableError("Embedding model previously failed to load")

    with _model_lock:
        if _model is not None:
            return _model
        if _load_failed:
            raise EmbeddingUnavailableError("Embedding model previously failed to load")
        try:
            from sentence_transformers import SentenceTransformer  # local import: optional dependency
        except ImportError as exc:
            _load_failed = True
            logger.warning(
                "sentence-transformers not installed - semantic similarity disabled, "
                "AI recommendation will use Gemini-only reasoning + rule-based fallback: %s",
                exc,
            )
            raise EmbeddingUnavailableError("sentence-transformers is not installed") from exc

        try:
            settings = get_settings()
            logger.info("Loading embedding model '%s' (first request only)...", settings.embedding_model_name)
            _model = SentenceTransformer(settings.embedding_model_name)
            logger.info("Embedding model loaded")
            return _model
        except Exception as exc:  # pragma: no cover - depends on network/model cache availability
            _load_failed = True
            logger.warning("Failed to load embedding model (non-fatal, using fallback): %s", exc)
            raise EmbeddingUnavailableError(f"Failed to load embedding model: {exc}") from exc


def is_available() -> bool:
    """Cheap check callers can use before doing embedding work, without
    triggering a load attempt themselves."""
    if _load_failed:
        return False
    try:
        _load_model()
        return True
    except EmbeddingUnavailableError:
        return False


def embed_texts(texts: Sequence[str]) -> "np.ndarray":
    """Embeds a batch of texts. Raises EmbeddingUnavailableError (never a
    raw ImportError/RuntimeError) if the model can't be used."""
    if not texts:
        return np.zeros((0, 0), dtype=np.float32)
    model = _load_model()
    try:
        vectors = model.encode(list(texts), normalize_embeddings=True, show_progress_bar=False)
        return np.asarray(vectors, dtype=np.float32)
    except Exception as exc:
        raise EmbeddingUnavailableError(f"Embedding generation failed: {exc}") from exc


def embed_text(text: str) -> "np.ndarray":
    return embed_texts([text])[0]


def cosine_similarity(a: "np.ndarray", b: "np.ndarray") -> float:
    """Both vectors are assumed already L2-normalized (encode(...,
    normalize_embeddings=True) does this), so cosine similarity reduces to
    a dot product. Falls back to a full computation if they aren't.
    Mathematically ranges -1..1 (raw, un-normalized cosine)."""
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0.0:
        return 0.0
    return float(np.dot(a, b) / denom)


def normalize_similarity(raw_cosine: float) -> float:
    """Rescales raw cosine similarity (-1..1) into a 0..1 range for
    user-facing display and for the confidence-style comparisons in
    `service.py`'s reconciliation logic. In practice sentence-transformers
    similarity for related short texts is almost always positive, but this
    keeps the value contractually bounded (schemas.py enforces 0..1)
    instead of relying on that being true 100% of the time."""
    return max(0.0, min(1.0, (raw_cosine + 1.0) / 2.0))


@dataclass(frozen=True)
class RankedCandidate:
    name: str
    similarity: float  # normalized, 0.0-1.0


def rank_by_similarity(query_vector: "np.ndarray", candidates: Sequence[Tuple[str, "np.ndarray"]]) -> List[RankedCandidate]:
    """Ranks `candidates` (name, vector) pairs against `query_vector`,
    highest similarity first. Scores are normalized to 0..1."""
    ranked = [
        RankedCandidate(name=name, similarity=normalize_similarity(cosine_similarity(query_vector, vector)))
        for name, vector in candidates
    ]
    ranked.sort(key=lambda c: c.similarity, reverse=True)
    return ranked
