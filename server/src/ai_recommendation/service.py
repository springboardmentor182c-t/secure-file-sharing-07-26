"""
Orchestrates the AI Smart Folder Recommendation flow:

    Extract content -> Grok -> validate -> (fail) -> Embeddings -> validate
        -> (fail) -> deterministic fallback

Reads real folders/files for the authenticated user via SQLAlchemy (the
same `File`/`Folder` entities the My Files module already uses) - no new
tables, no dummy data.
"""
import logging
import uuid
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from src.ai_recommendation import embedding_service, grok_service
from src.ai_recommendation.config import AI_FOLDER_CONTEXT_FILE_SAMPLE, AI_HISTORY_SAMPLE_SIZE
from src.ai_recommendation.exceptions import EmbeddingUnavailableError, GrokUnavailableError, InvalidRecommendationError
from src.ai_recommendation.schemas import RecommendationData
from src.ai_recommendation.utils import extract_text_content
from src.entities.file import File
from src.entities.folder import Folder

logger = logging.getLogger("app.ai_recommendation")


# ---------------------------------------------------------------------------
# Real-data context builders (no fabricated folders/files/history)
# ---------------------------------------------------------------------------


def _load_user_folders(db: Session, owner_id: uuid.UUID) -> list[dict]:
    folders = db.query(Folder).filter(Folder.owner_id == owner_id).all()
    result = []
    for folder in folders:
        sample_files = (
            db.query(File.original_filename)
            .filter(File.folder_id == folder.id, File.owner_id == owner_id, File.is_deleted.is_(False))
            .order_by(File.created_at.desc())
            .limit(AI_FOLDER_CONTEXT_FILE_SAMPLE)
            .all()
        )
        file_count = (
            db.query(func.count(File.id))
            .filter(File.folder_id == folder.id, File.owner_id == owner_id, File.is_deleted.is_(False))
            .scalar()
            or 0
        )
        result.append({
            "id": folder.id,
            "name": folder.name,
            "sample_filenames": [f[0] for f in sample_files],
            "file_count": file_count,
        })
    return result


def _load_extension_history(db: Session, owner_id: uuid.UUID, extension: str) -> list[dict]:
    """Real prior uploads with the same extension, mapped to the folder they
    ended up in - the "previous activity" signal. Returns [] (never fake
    data) if there's nothing real to show."""
    if not extension:
        return []

    rows = (
        db.query(File.original_filename, Folder.id, Folder.name)
        .join(Folder, File.folder_id == Folder.id)
        .filter(
            File.owner_id == owner_id,
            File.is_deleted.is_(False),
            File.extension == extension,
        )
        .order_by(File.created_at.desc())
        .limit(AI_HISTORY_SAMPLE_SIZE)
        .all()
    )
    return [{"filename": r[0], "folder_id": str(r[1]), "folder_name": r[2]} for r in rows]


# ---------------------------------------------------------------------------
# Validation - never trust AI/embedding output blindly
# ---------------------------------------------------------------------------


def _validate_against_real_folders(folder_id_str: str, folders: list[dict]) -> dict:
    try:
        candidate_id = uuid.UUID(folder_id_str)
    except ValueError as exc:
        raise InvalidRecommendationError("Recommended folder id is not a valid UUID") from exc

    for folder in folders:
        if folder["id"] == candidate_id:
            return folder
    raise InvalidRecommendationError("Recommended folder does not exist or is not owned by this user")


# ---------------------------------------------------------------------------
# Deterministic fallback (worst case) - never hard-coded, never invents data
# ---------------------------------------------------------------------------


def _deterministic_fallback(folders: list[dict], current_folder_id: Optional[uuid.UUID]) -> Optional[dict]:
    if not folders:
        return None
    if current_folder_id is not None:
        for folder in folders:
            if folder["id"] == current_folder_id:
                return folder
    # Deterministic, not arbitrary: the folder with the most existing files
    # is the user's most-used destination, a reasonable neutral default.
    return max(folders, key=lambda f: f["file_count"])


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def recommend_folder(
    db: Session,
    *,
    owner_id: uuid.UUID,
    filename: str,
    mime_type: str,
    contents: bytes,
    current_folder_id: Optional[uuid.UUID] = None,
) -> RecommendationData:
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    size = len(contents)

    extracted_content = extract_text_content(
        filename=filename, extension=extension, mime_type=mime_type, contents=contents,
    )

    folders = _load_user_folders(db, owner_id)
    if not folders:
        logger.info("AI recommendation: user %s has no folders yet", owner_id)
        return RecommendationData(
            recommended_folder_id=None,
            recommended_folder_name=None,
            confidence=0.0,
            reason="You don't have any folders yet - create one, or upload to My Files root.",
            source="fallback",
            has_folders=False,
        )

    history = _load_extension_history(db, owner_id, extension)

    # 1) Grok (primary)
    logger.info("AI recommendation started user=%s file=%s", owner_id, filename)
    try:
        logger.info("Grok recommendation attempted user=%s", owner_id)
        candidate = grok_service.get_grok_recommendation(
            filename=filename, extension=extension, mime_type=mime_type, size=size,
            extracted_content=extracted_content, folders=folders, history=history,
        )
        folder = _validate_against_real_folders(candidate.recommended_folder_id, folders)
        logger.info(
            "AI recommendation complete source=grok confidence=%.2f user=%s", candidate.confidence, owner_id,
        )
        return RecommendationData(
            recommended_folder_id=folder["id"], recommended_folder_name=folder["name"],
            confidence=candidate.confidence, reason=candidate.reason or "Selected by Grok.", source="grok",
        )
    except GrokUnavailableError as exc:
        logger.debug("Grok recommendation failed user=%s reason=%s", owner_id, exc)
    except InvalidRecommendationError as exc:
        logger.warning("Grok recommendation rejected user=%s reason=%s", owner_id, exc)

    # 2) Local embeddings (second method)
    try:
        logger.info("Embedding recommendation attempted user=%s", owner_id)
        candidate = embedding_service.get_embedding_recommendation(
            filename=filename, extension=extension, extracted_content=extracted_content, folders=folders,
        )
        folder = _validate_against_real_folders(candidate.recommended_folder_id, folders)
        logger.info(
            "AI recommendation complete source=embedding confidence=%.2f user=%s", candidate.confidence, owner_id,
        )
        return RecommendationData(
            recommended_folder_id=folder["id"], recommended_folder_name=folder["name"],
            confidence=candidate.confidence, reason=candidate.reason, source="embedding",
        )
    except EmbeddingUnavailableError as exc:
        logger.debug("Embedding recommendation failed user=%s reason=%s", owner_id, exc)
    except InvalidRecommendationError as exc:
        logger.warning("Embedding recommendation rejected user=%s reason=%s", owner_id, exc)

    # 3) Deterministic fallback (worst case)
    logger.info("Fallback recommendation used user=%s", owner_id)
    folder = _deterministic_fallback(folders, current_folder_id)
    if folder is None:
        return RecommendationData(
            recommended_folder_id=None, recommended_folder_name=None, confidence=0.0,
            reason="AI recommendation is currently unavailable. Please select a folder manually.",
            source="fallback", has_folders=True,
        )
    return RecommendationData(
        recommended_folder_id=folder["id"], recommended_folder_name=folder["name"], confidence=0.0,
        reason="AI recommendation is currently unavailable, so your most-used folder is suggested. "
        "Please double-check before uploading.",
        source="fallback",
    )
