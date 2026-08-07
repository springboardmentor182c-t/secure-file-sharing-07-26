"""
Business logic for the AI Smart Folder Recommendation module.

Orchestration for one recommendation request:
  1. Build file metadata from the upload; extract text (PDF/TXT/DOCX/MD/CSV).
  2. Generate a lightweight summary + keywords from that text.
  3. Load the user's own folders + upload history from PostgreSQL (never
     dummy data), and build a dynamic representation of each folder
     (name, representative filenames, recent uploads, common keywords,
     and a bounded sample of recent document summaries read from the
     user's own encrypted storage). This representation is reused for
     both the embedding engine and the Gemini prompt itself.
  4. Embed the document and every folder representation
     (sentence-transformers, pretrained, loaded once and reused - see
     `embedding_service.py`) and rank folders by cosine similarity -> Top
     K candidates. Folder embedding vectors are cached per-owner and only
     recomputed when a folder's real content actually changes.
  5. Ask Gemini (the primary AI engine) to reason over the Top K
     candidates + full folder descriptions + history + summary/keywords.
  6. Reconcile Gemini's answer with the embedding ranking: if Gemini
     agrees with (is inside) the Top K, use it; if it picks an existing
     folder outside the Top K, compare Gemini's confidence against the
     embedding's similarity score and use whichever is stronger (see
     `schemas.RecommendationSource` for the exact source values).
  7. If Gemini is unavailable/invalid, the embedding engine's own Top-1
     is used automatically (embeddings are the secondary AI engine). The
     deterministic rule-based fallback only executes if BOTH Gemini and
     the embedding engine fail for this request.

The AI recommendation must NEVER fail or block the upload - every branch
below degrades to the next tier instead of raising past this module.
"""
import hashlib
import logging
import threading
import time
import uuid
from collections import Counter
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np
from fastapi import UploadFile
from sqlalchemy.orm import Session

from src.ai_recommendation import embedding_service, gemini_service
from src.ai_recommendation.config import Settings, get_settings
from src.ai_recommendation.embedding_service import RankedCandidate
from src.ai_recommendation.exceptions import (
    EmbeddingUnavailableError,
    GeminiNotConfiguredError,
    GeminiRequestError,
    GeminiTimeoutError,
    InvalidGeminiResponseError,
)
from src.ai_recommendation.prompt_builder import build_recommendation_prompt
from src.ai_recommendation.schemas import (
    CandidateFolder,
    FolderSummary,
    GeminiRecommendationPayload,
    RecommendFolderResponse,
    UploadHistoryEntry,
)
from src.ai_recommendation.utils import (
    build_file_metadata,
    extract_keywords,
    extract_text_content,
    generate_summary,
    is_text_extractable,
)
from src.entities.file import File
from src.entities.folder import Folder
from src.files.constants import EncryptionStatus
from src.files.encryption import decrypt_bytes
from src.files.storage import get_storage_backend

logger = logging.getLogger("app.ai_recommendation")

# Extension -> generic category name used only when the user has no
# folders at all yet (nothing to recommend from, embeddings/Gemini skipped).
_EXTENSION_CATEGORY_MAP = {
    "pdf": "Documents", "doc": "Documents", "docx": "Documents", "txt": "Documents",
    "md": "Documents", "rtf": "Documents", "odt": "Documents",
    "xls": "Finance", "xlsx": "Finance", "csv": "Finance", "ods": "Finance",
    "ppt": "Presentations", "pptx": "Presentations", "odp": "Presentations",
    "jpg": "Images", "jpeg": "Images", "png": "Images", "gif": "Images",
    "webp": "Images", "svg": "Images", "bmp": "Images", "tiff": "Images",
    "mp3": "Media", "wav": "Media", "mp4": "Media", "mov": "Media", "avi": "Media", "mkv": "Media",
    "zip": "Archives", "tar": "Archives", "gz": "Archives", "rar": "Archives", "7z": "Archives",
    "json": "Engineering", "xml": "Engineering", "yaml": "Engineering", "yml": "Engineering",
    "sql": "Engineering", "log": "Engineering",
}

_CATEGORY_KEYWORDS = {
    "Documents": ("document", "doc", "paper", "report", "text"),
    "Finance": ("finance", "invoice", "budget", "expense", "sheet", "spreadsheet", "bill"),
    "Presentations": ("presentation", "deck", "slide"),
    "Images": ("image", "photo", "picture", "screenshot", "design"),
    "Media": ("media", "video", "audio", "music", "recording"),
    "Archives": ("archive", "backup", "zip"),
    "Engineering": ("engineering", "code", "dev", "project", "data"),
}


# ---------------------------------------------------------------------------
# Data loading (real DB records / real decrypted storage only - never
# dummy folders, uploads, or content)
# ---------------------------------------------------------------------------


def _load_user_folders(db: Session, owner_id: uuid.UUID) -> List[FolderSummary]:
    rows = db.query(Folder).filter(Folder.owner_id == owner_id).order_by(Folder.name.asc()).all()
    return [FolderSummary(id=row.id, name=row.name) for row in rows]


def _load_upload_history(db: Session, owner_id: uuid.UUID, limit: int) -> List[UploadHistoryEntry]:
    rows = (
        db.query(File)
        .filter(File.owner_id == owner_id, File.is_deleted.is_(False))
        .order_by(File.created_at.desc())
        .limit(limit)
        .all()
    )
    entries: List[UploadHistoryEntry] = []
    for row in rows:
        folder_name = row.folder.name if row.folder is not None else None
        entries.append(
            UploadHistoryEntry(
                filename=row.original_filename,
                extension=row.extension,
                folder_name=folder_name,
                category=row.category,
            )
        )
    return entries


def _sample_recent_files_in_folder(db: Session, owner_id: uuid.UUID, folder_id: uuid.UUID, limit: int) -> List[File]:
    return (
        db.query(File)
        .filter(File.owner_id == owner_id, File.folder_id == folder_id, File.is_deleted.is_(False))
        .order_by(File.created_at.desc())
        .limit(limit)
        .all()
    )


def _read_sample_file_text(file_obj: File, settings: Settings) -> str:
    """Best-effort: decrypt + extract a short summary from one of the
    user's own already-uploaded files, to enrich its folder's
    representation with real recent content. Bounded by size and char
    count for performance; any failure degrades to "" (filename-only
    signal for that file) rather than raising."""
    if file_obj.size > settings.folder_sample_max_file_bytes:
        return ""
    if not is_text_extractable(file_obj.extension):
        return ""
    try:
        raw = get_storage_backend().read(file_obj.file_path)
        plaintext = decrypt_bytes(raw) if file_obj.encryption_status == EncryptionStatus.ENCRYPTED.value else raw
        text = extract_text_content(file_obj.extension, plaintext, settings.folder_sample_max_chars_per_file)
        return generate_summary(text, max_sentences=2, max_chars=settings.folder_sample_max_chars_per_file)
    except Exception as exc:  # pragma: no cover - depends on local disk/key state
        logger.debug("Folder-sample content extraction skipped for file %s: %s", file_obj.id, exc)
        return ""


def _build_folder_representation(db: Session, owner_id: uuid.UUID, folder: FolderSummary, settings: Settings) -> str:
    """Builds a dynamic text representation of one folder from real data
    only: folder name, representative filenames, recent upload count,
    common keywords, and a bounded sample of recent document summaries.
    Never hardcoded - an empty folder just gets a name-only representation.
    """
    recent_files = _sample_recent_files_in_folder(
        db, owner_id, folder.id, limit=max(5, settings.folder_sample_files)
    )
    filenames = [f.original_filename for f in recent_files[:5]]
    content_summaries = [
        text for f in recent_files[: settings.folder_sample_files] if (text := _read_sample_file_text(f, settings))
    ]

    keyword_source = " ".join(filenames + content_summaries)
    keywords = extract_keywords(keyword_source, top_n=8)

    parts = [f"Folder name: {folder.name}."]
    if filenames:
        parts.append("Representative filenames: " + ", ".join(filenames) + ".")
    if recent_files:
        parts.append(f"Recent uploads: {len(recent_files)} file(s).")
    if keywords:
        parts.append("Common keywords: " + ", ".join(keywords) + ".")
    if content_summaries:
        parts.append("Recent document summaries: " + " ".join(content_summaries))
    if len(parts) == 1:
        parts.append("This folder currently has no files yet.")
    return " ".join(parts)


# ---------------------------------------------------------------------------
# Document extraction
# ---------------------------------------------------------------------------


async def _read_upload_bytes(upload: UploadFile, max_bytes: int) -> bytes:
    contents = await upload.read()
    if len(contents) > max_bytes:
        contents = contents[:max_bytes]
    try:
        await upload.seek(0)
    except Exception:  # pragma: no cover - some UploadFile backends may not support seek
        pass
    return contents


# ---------------------------------------------------------------------------
# Embedding-based ranking
# ---------------------------------------------------------------------------

# Per-owner in-process cache of folder embedding vectors, keyed by a hash
# of the underlying folder representations. The embedding *model* is
# already a process-wide singleton (see embedding_service.py, loaded once);
# this cache additionally avoids re-encoding every folder on every request
# when nothing about the user's folders has changed since last time (e.g.
# hitting "Refresh" or uploading several files in a row) - a real
# performance win, while still recomputing automatically the moment any
# folder's real content changes (new upload, new folder, etc.).
_folder_embedding_cache: Dict[uuid.UUID, Tuple[str, Dict[str, "np.ndarray"]]] = {}
_folder_embedding_cache_lock = threading.Lock()


def _hash_folder_representations(folder_reprs: Dict[str, str]) -> str:
    joined = "\x1f".join(f"{name}\x1e{text}" for name, text in sorted(folder_reprs.items()))
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()


def _get_folder_vectors_cached(
    owner_id: uuid.UUID, folder_reprs: Dict[str, str]
) -> Dict[str, "np.ndarray"]:
    """Returns {folder_name: embedding_vector}, reusing the cached vectors
    for this owner if their folder representations are byte-for-byte
    identical to last time; otherwise (re-)embeds and caches. Raises
    EmbeddingUnavailableError if the model can't be used at all."""
    repr_hash = _hash_folder_representations(folder_reprs)

    with _folder_embedding_cache_lock:
        cached = _folder_embedding_cache.get(owner_id)
        if cached is not None and cached[0] == repr_hash:
            return cached[1]

    names = list(folder_reprs.keys())
    vectors = embedding_service.embed_texts([folder_reprs[name] for name in names])
    mapping = {name: vectors[i] for i, name in enumerate(names)}

    with _folder_embedding_cache_lock:
        _folder_embedding_cache[owner_id] = (repr_hash, mapping)
    return mapping


def _rank_folders_by_embedding(
    *,
    metadata_filename: str,
    metadata_extension: str,
    raw_text: str,
    summary: str,
    keywords: Sequence[str],
    owner_id: uuid.UUID,
    folder_reprs: Dict[str, str],
) -> List[RankedCandidate]:
    """Raises EmbeddingUnavailableError if embeddings can't be used for
    this request (dependency missing / model failed to load). Callers
    catch this and fall through to the next tier.

    Per spec, the document embedding combines filename + extracted text +
    summary + keywords into one semantic representation."""
    doc_repr_text = " ".join(
        part for part in (
            metadata_filename, metadata_extension,
            _truncate_for_embedding(raw_text), summary, " ".join(keywords),
        ) if part
    ).strip()

    folder_vectors = _get_folder_vectors_cached(owner_id, folder_reprs)
    doc_vector = embedding_service.embed_text(doc_repr_text)
    candidate_pairs = list(folder_vectors.items())
    return embedding_service.rank_by_similarity(doc_vector, candidate_pairs)


def _truncate_for_embedding(text: str, max_chars: int = 600) -> str:
    """A short, bounded slice of the raw extracted text purely for the
    embedding input (separate from the Gemini-facing summary) - keeps
    encode() fast and avoids embedding an entire large document."""
    if not text:
        return ""
    return text[:max_chars]


# ---------------------------------------------------------------------------
# Rule-based fallback (used only when embeddings are unavailable, e.g.
# sentence-transformers isn't installed, or the user has no folders yet)
# ---------------------------------------------------------------------------


def _category_for_extension(extension: str) -> str:
    return _EXTENSION_CATEGORY_MAP.get(extension.lower(), "Other")


def _match_folder_by_history(extension: str, history: Sequence[UploadHistoryEntry]) -> Optional[str]:
    same_ext_folders = [h.folder_name for h in history if h.extension.lower() == extension.lower() and h.folder_name]
    if not same_ext_folders:
        return None
    return Counter(same_ext_folders).most_common(1)[0][0]


def _match_folder_by_keyword(extension: str, folders: Sequence[FolderSummary]) -> Optional[str]:
    category = _category_for_extension(extension)
    keywords = _CATEGORY_KEYWORDS.get(category, ())
    for folder in folders:
        lowered = folder.name.lower()
        if any(keyword in lowered for keyword in keywords):
            return folder.name
    return None


def _most_recent_folder(history: Sequence[UploadHistoryEntry]) -> Optional[str]:
    for entry in history:  # already ordered most-recent-first
        if entry.folder_name:
            return entry.folder_name
    return None


def _build_fallback_recommendation(
    *, extension: str, folders: Sequence[FolderSummary], history: Sequence[UploadHistoryEntry]
) -> GeminiRecommendationPayload:
    """Fallback strategy: file extension -> existing folder names ->
    previous uploads -> generic category. Never raises."""
    by_history = _match_folder_by_history(extension, history)
    if by_history:
        return GeminiRecommendationPayload(
            recommended_folder=by_history, confidence=68.0,
            reason=f"You've previously filed .{extension} files into '{by_history}'.",
        )

    by_keyword = _match_folder_by_keyword(extension, folders)
    if by_keyword:
        return GeminiRecommendationPayload(
            recommended_folder=by_keyword, confidence=52.0,
            reason=f"'{by_keyword}' looks like the best existing match for a .{extension} file.",
        )

    by_recent = _most_recent_folder(history)
    if by_recent:
        return GeminiRecommendationPayload(
            recommended_folder=by_recent, confidence=35.0,
            reason=f"No strong match found; '{by_recent}' is where you upload most often.",
        )

    category = _category_for_extension(extension)
    return GeminiRecommendationPayload(
        recommended_folder=category, confidence=25.0,
        reason=f"No matching folder found; '{category}' is a reasonable new folder for .{extension} files.",
    )


# ---------------------------------------------------------------------------
# Folder-name -> folder_id resolution
# ---------------------------------------------------------------------------


def _resolve_folder_id(recommended_name: str, folders: Sequence[FolderSummary]) -> Optional[uuid.UUID]:
    lowered = recommended_name.strip().lower()
    for folder in folders:
        if folder.name.strip().lower() == lowered:
            return folder.id
    return None


def _to_candidate_folders(
    candidates: Sequence[RankedCandidate], folders: Sequence[FolderSummary], *, exclude_name: str
) -> List[CandidateFolder]:
    excluded_lower = exclude_name.strip().lower()
    out: List[CandidateFolder] = []
    for c in candidates:
        if c.name.strip().lower() == excluded_lower:
            continue
        out.append(CandidateFolder(folder_name=c.name, folder_id=_resolve_folder_id(c.name, folders), similarity_score=c.similarity))
    return out


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------


async def get_folder_recommendation(
    db: Session, *, owner_id: uuid.UUID, upload: UploadFile
) -> RecommendFolderResponse:
    settings = get_settings()
    request_start = time.perf_counter()

    contents = await _read_upload_bytes(upload, settings.max_upload_read_bytes)
    metadata = build_file_metadata(upload.filename, upload.content_type, len(contents))

    folders = _load_user_folders(db, owner_id)
    history = _load_upload_history(db, owner_id, settings.history_limit)

    # --- Extraction + summary + keywords -----------------------------------
    extraction_start = time.perf_counter()
    raw_text = extract_text_content(metadata.extension, contents, settings.max_extract_chars) if is_text_extractable(metadata.extension) else ""
    extraction_ms = (time.perf_counter() - extraction_start) * 1000

    summary = generate_summary(raw_text, settings.summary_max_sentences) if raw_text else ""
    keyword_source = raw_text or metadata.filename
    keywords = extract_keywords(keyword_source, settings.keyword_top_n)

    extracted_summary_for_prompt = summary or (
        f'No extractable text for this file type ("{metadata.filename}"). Use the filename and extension only.'
    )

    logger.info(
        "Extraction complete owner=%s filename=%s ext=%s extraction_ms=%.0f text_chars=%d",
        owner_id, metadata.filename, metadata.extension, extraction_ms, len(raw_text),
    )

    # --- No folders at all: nothing to rank/recommend against --------------
    if not folders:
        payload = _build_fallback_recommendation(extension=metadata.extension, folders=[], history=history)
        logger.info(
            "Folder recommendation complete owner=%s source=fallback (no folders yet) total_latency_ms=%.0f",
            owner_id, (time.perf_counter() - request_start) * 1000,
        )
        return RecommendFolderResponse(
            recommended_folder=payload.recommended_folder, folder_id=None, is_new_folder_suggestion=True,
            confidence=payload.confidence, reason=payload.reason, source="fallback",
            similarity_score=None, alternative_folders=[], keywords=keywords,
            available_folders=[], embedding_engine_available=False,
        )

    # --- Folder representations (real data: names, recent filenames,
    # keywords, recent document summaries, upload counts) - built once and
    # reused for both the embedding engine and the Gemini prompt itself. --
    folder_reprs: Dict[str, str] = {
        folder.name: _build_folder_representation(db, owner_id, folder, settings) for folder in folders
    }

    # --- Embedding ranking (secondary AI engine - validates/ranks) ---------
    top_candidates: List[RankedCandidate] = []
    embedding_available = False
    embed_start = time.perf_counter()
    try:
        ranked = _rank_folders_by_embedding(
            metadata_filename=metadata.filename, metadata_extension=metadata.extension,
            raw_text=raw_text, summary=summary, keywords=keywords,
            owner_id=owner_id, folder_reprs=folder_reprs,
        )
        top_candidates = ranked[: settings.top_k_candidates]
        embedding_available = True
        logger.info(
            "Embedding ranking complete owner=%s embedding_ms=%.0f top1=%s(%.3f)",
            owner_id, (time.perf_counter() - embed_start) * 1000,
            top_candidates[0].name if top_candidates else None,
            top_candidates[0].similarity if top_candidates else 0.0,
        )
    except EmbeddingUnavailableError as exc:
        logger.warning("Embedding engine unavailable owner=%s error=%s", owner_id, exc)

    # --- Gemini reasoning (primary AI engine) -------------------------------
    gemini_payload: Optional[GeminiRecommendationPayload] = None
    gemini_start = time.perf_counter()
    if settings.is_ai_enabled:
        try:
            prompt = build_recommendation_prompt(
                filename=metadata.filename, extension=metadata.extension, mime_type=metadata.mime_type,
                extracted_summary=extracted_summary_for_prompt, keywords=keywords,
                folders=folders, folder_descriptions=folder_reprs,
                top_candidates=top_candidates, history=history,
            )
            available_names = {f.name.strip().lower() for f in folders}
            gemini_payload = await gemini_service.get_gemini_recommendation(
                prompt, available_folder_names=available_names, settings=settings
            )
            logger.info(
                "Gemini recommendation ok owner=%s model=%s latency_ms=%.0f confidence=%.1f folder=%s",
                owner_id, settings.gemini_model, (time.perf_counter() - gemini_start) * 1000,
                gemini_payload.confidence, gemini_payload.recommended_folder,
            )
        except (GeminiNotConfiguredError, GeminiTimeoutError, GeminiRequestError, InvalidGeminiResponseError) as exc:
            logger.warning(
                "Gemini recommendation failed owner=%s model=%s latency_ms=%.0f error=%s - using embedding/fallback",
                owner_id, settings.gemini_model, (time.perf_counter() - gemini_start) * 1000, exc,
            )
    else:
        logger.info("GEMINI_API_KEY not set owner=%s - using embedding/fallback recommendation", owner_id)

    # --- Reconciliation (spec: Gemini primary, embeddings validate/rank;
    # fallback only if BOTH fail) --------------------------------------------
    top_names_lower = {c.name.strip().lower() for c in top_candidates}

    if gemini_payload is not None and embedding_available and top_candidates and gemini_payload.recommended_folder.strip().lower() not in top_names_lower:
        # Gemini picked an existing folder outside the embedding Top K -
        # compare confidence and use whichever recommendation is stronger.
        best = top_candidates[0]
        embedding_confidence_equivalent = best.similarity * 100
        if gemini_payload.confidence >= embedding_confidence_equivalent:
            final = GeminiRecommendationPayload(
                recommended_folder=gemini_payload.recommended_folder,
                confidence=gemini_payload.confidence,
                reason=gemini_payload.reason,
            )
        else:
            final = GeminiRecommendationPayload(
                recommended_folder=best.name,
                confidence=round(embedding_confidence_equivalent, 1),
                reason=(
                    f"Semantic similarity ({best.similarity:.0%}) for '{best.name}' was stronger than "
                    f"Gemini's confidence for '{gemini_payload.recommended_folder}'; using '{best.name}' instead."
                ),
            )
        source = "ai_adjusted"
    elif gemini_payload is not None:
        final = gemini_payload
        source = "ai"
    elif embedding_available and top_candidates:
        best = top_candidates[0]
        final = GeminiRecommendationPayload(
            recommended_folder=best.name, confidence=round(best.similarity * 100, 1),
            reason=f"Most semantically similar folder based on content and filename ({best.similarity:.0%} match).",
        )
        source = "embedding"
    else:
        # Both Gemini and the embedding engine failed - final safety net.
        final = _build_fallback_recommendation(extension=metadata.extension, folders=folders, history=history)
        source = "fallback"

    folder_id = _resolve_folder_id(final.recommended_folder, folders)
    matching_candidate = next((c for c in top_candidates if c.name.strip().lower() == final.recommended_folder.strip().lower()), None)
    similarity_score = matching_candidate.similarity if matching_candidate else None
    alternatives = _to_candidate_folders(top_candidates, folders, exclude_name=final.recommended_folder)

    total_latency_ms = (time.perf_counter() - request_start) * 1000
    logger.info(
        "Folder recommendation complete owner=%s source=%s confidence=%.1f similarity=%s total_latency_ms=%.0f",
        owner_id, source, final.confidence, f"{similarity_score:.3f}" if similarity_score is not None else "n/a", total_latency_ms,
    )

    return RecommendFolderResponse(
        recommended_folder=final.recommended_folder,
        folder_id=folder_id,
        is_new_folder_suggestion=folder_id is None,
        confidence=final.confidence,
        reason=final.reason,
        source=source,
        similarity_score=similarity_score,
        alternative_folders=alternatives,
        keywords=keywords,
        available_folders=[f.name for f in folders],
        embedding_engine_available=embedding_available,
    )
