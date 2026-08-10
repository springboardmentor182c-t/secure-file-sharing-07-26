"""
Local sentence-embedding recommendation - second method in the chain.

Compares the uploaded file's text (content, or filename/extension as a
fallback signal) against each existing folder's *real* context (folder name
+ a sample of its actual filenames) using cosine similarity. No training,
no dataset - a single pretrained sentence-transformers model, loaded once
and reused for every request.
"""
import logging
import threading

from src.ai_recommendation.config import AI_EMBEDDING_MIN_SIMILARITY, AI_EMBEDDING_MODEL
from src.ai_recommendation.exceptions import EmbeddingUnavailableError
from src.ai_recommendation.schemas import RawGrokRecommendation

logger = logging.getLogger("app.ai_recommendation")

_model = None
_model_lock = threading.Lock()
_model_load_failed = None


def _get_model():
    global _model, _model_load_failed
    if _model is not None:
        return _model

    with _model_lock:
        if _model is not None:
            return _model

        if _model_load_failed is not None:
            try:
                import sentence_transformers  # noqa: F401
            except ImportError as exc:
                raise EmbeddingUnavailableError("sentence-transformers is not installed") from exc
            _model_load_failed = None

        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as exc:
            _model_load_failed = exc
            raise EmbeddingUnavailableError("sentence-transformers is not installed") from exc

        try:
            _model = SentenceTransformer(AI_EMBEDDING_MODEL)
        except Exception as exc:
            _model_load_failed = exc
            raise EmbeddingUnavailableError(f"Failed to load embedding model: {exc}") from exc

    return _model


def _folder_context_text(folder: dict) -> str:
    parts = [folder["name"]]
    parts.extend(folder.get("sample_filenames", []))
    return " | ".join(parts)


def _document_text(*, filename: str, extension: str, extracted_content: str) -> str:
    # Content carries the most signal when we have it; filename/extension
    # always contributes since it's cheap and real.
    pieces = [filename]
    if extension:
        pieces.append(extension)
    if extracted_content:
        pieces.append(extracted_content)
    return " | ".join(pieces)


def get_embedding_recommendation(
    *,
    filename: str,
    extension: str,
    extracted_content: str,
    folders: list[dict],
) -> RawGrokRecommendation:
    if not folders:
        raise EmbeddingUnavailableError("No folders available to compare against")

    model = _get_model()

    doc_text = _document_text(filename=filename, extension=extension, extracted_content=extracted_content)
    folder_texts = [_folder_context_text(f) for f in folders]

    try:
        doc_vec = model.encode([doc_text], normalize_embeddings=True)[0]
        folder_vecs = model.encode(folder_texts, normalize_embeddings=True)
    except Exception as exc:
        raise EmbeddingUnavailableError(f"Embedding computation failed: {exc}") from exc

    best_idx = None
    best_score = -1.0
    for i, vec in enumerate(folder_vecs):
        score = float(_cosine_similarity(doc_vec, vec))
        if score > best_score:
            best_score = score
            best_idx = i

    if best_idx is None:
        raise EmbeddingUnavailableError("No similarity scores could be computed")

    best_folder = folders[best_idx]
    # Cosine similarity (roughly -1..1, in practice ~0..1 for normalized
    # sentence embeddings) is not literally a probability, but we present a
    # bounded, monotonic confidence figure derived from it rather than
    # pretending it IS an LLM confidence score.
    confidence = max(0.0, min(1.0, best_score))

    return RawGrokRecommendation(
        recommended_folder_id=str(best_folder["id"]),
        confidence=confidence,
        reason=(
            f'Semantic similarity between the file and folder "{best_folder["name"]}" '
            f"was the highest among existing folders (similarity score {best_score:.2f})."
        ),
    )


def _cosine_similarity(a, b) -> float:
    import numpy as np

    a = np.asarray(a)
    b = np.asarray(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1e-9
    return float(np.dot(a, b) / denom)
