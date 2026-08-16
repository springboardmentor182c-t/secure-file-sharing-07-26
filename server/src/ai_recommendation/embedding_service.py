"""
Local sentence-embedding recommendation - second method in the chain.

Compares the uploaded file's text (content, or filename/extension as a
fallback signal) against each existing folder's *real* context (folder name
+ a sample of its actual filenames) using cosine similarity. No training,
no dataset - a single pretrained sentence-transformers model, loaded once
and reused for every request.
"""
import logging
import re
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


def _document_text(*, filename: str, extension: str, extracted_content: str) -> str:
    """Builds a rich textual representation of the document for embedding matching."""
    parts = [filename]
    if extension:
        parts.append(f"type: .{extension}")
    if extracted_content:
        parts.append(extracted_content[:2000])
    return " | ".join(parts)


def _folder_context_text(folder: dict) -> str:
    parts = [folder["name"]]
    parts.extend(folder.get("sample_filenames", []))
    # Semantic enrichment for common terms
    f_lower = folder["name"].lower()
    if "career" in f_lower or "job" in f_lower or "work" in f_lower:
        parts.extend(["resume", "cv", "experience", "education", "skills", "application", "portfolio"])
    elif "bill" in f_lower or "finance" in f_lower or "invoice" in f_lower or "tax" in f_lower:
        parts.extend(["receipt", "payment", "bank", "statement", "accounting", "utility"])
    elif "project" in f_lower or "code" in f_lower or "dev" in f_lower:
        parts.extend(["software", "repo", "script", "assignment", "build"])
    elif "personal" in f_lower or "doc" in f_lower:
        parts.extend(["passport", "id", "certificate", "medical", "letter"])

    return " | ".join(parts)


def extract_category_from_text(filename: str, extracted_content: str) -> str:
    """Fallback rule-based category extraction when AI is unavailable."""
    fn_lower = filename.lower()
    content_lower = (extracted_content or "").lower()[:2000]

    if any(k in fn_lower or k in content_lower for k in ["resume", "cv", "education", "experience", "skills", "job application"]):
        return "Career"
    if any(k in fn_lower or k in content_lower for k in ["invoice", "receipt", "bill", "payment", "tax", "statement", "bank"]):
        return "Financial Documents"
    if any(k in fn_lower or k in content_lower for k in ["research", "paper", "journal", "machine learning", "dataset", "thesis"]):
        return "Research & Papers"
    if any(k in fn_lower or k in content_lower for k in ["project", "code", "script", "repository", "source"]):
        return "Projects"
    if any(k in fn_lower or k in content_lower for k in ["certificate", "diploma", "license", "certification"]):
        return "Certificates"

    # Default: sanitize filename stem
    stem = filename.rsplit(".", 1)[0] if "." in filename else filename
    # Remove numbers, dates, underscores
    clean = re.sub(r"[\d_\-]+", " ", stem).strip()
    return clean if clean else "General Documents"


def get_embedding_recommendation(
    *,
    filename: str,
    extension: str,
    extracted_content: str,
    folders: list[dict],
) -> RawGrokRecommendation:
    model = _get_model()

    doc_text = _document_text(filename=filename, extension=extension, extracted_content=extracted_content)

    if folders:
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

        if best_idx is not None and best_score >= AI_EMBEDDING_MIN_SIMILARITY:
            best_folder = folders[best_idx]
            confidence = max(0.0, min(1.0, best_score))
            return RawGrokRecommendation(
                recommended_folder_id=str(best_folder["id"]),
                confidence=confidence,
                reason=(
                    f'Semantic similarity between the file and folder "{best_folder["name"]}" '
                    f"was high (score {best_score:.2f})."
                ),
            )

    # If no existing folder meets similarity, generate a category name candidate
    category_name = extract_category_from_text(filename, extracted_content)
    return RawGrokRecommendation(
        recommended_folder_id="",  # Empty signals to service.py to create or match folder for category_name
        confidence=0.70,
        reason=f"Categorized as '{category_name}' based on semantic document content.",
    )



def _cosine_similarity(a, b) -> float:
    import numpy as np

    a = np.asarray(a)
    b = np.asarray(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1e-9
    return float(np.dot(a, b) / denom)
