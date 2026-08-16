"""
Folder matching and creation manager for AI Smart Folder Recommendation.

Handles:
1. Sanitizing folder/category names proposed by AI.
2. Checking existing user folders via semantic matching.
3. Creating new folders via existing files.service logic when no folder is suitable.
"""
import logging
import re
import uuid
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from src.ai_recommendation.config import (
    AI_AUTO_CREATE_FOLDERS,
    AI_FOLDER_SIMILARITY_THRESHOLD,
)
from src.ai_recommendation.embedding_service import _get_model, _cosine_similarity
from src.files import service as files_service

logger = logging.getLogger("app.ai_recommendation")


def sanitize_folder_name(raw_name: str) -> str:
    """Sanitize and clean up raw folder category names.
    Removes file extensions, quotes, noise, and formats to concise title case.
    """
    if not raw_name:
        return "General Documents"

    name = raw_name.strip().strip("\"' `")

    # Remove common document extensions if model included them
    name = re.sub(r"\.(pdf|docx?|txt|xlsx?|csv|png|jpe?g)$", "", name, flags=re.IGNORECASE)

    # Clean non-alphanumeric characters except spaces, hyphens, and ampersands
    name = re.sub(r"[^\w\s\-\&]", " ", name)
    name = re.sub(r"\s+", " ", name).strip()

    if not name:
        return "General Documents"

    # Truncate overly long names
    if len(name) > 40:
        words = name.split()
        truncated = []
        length = 0
        for w in words:
            if length + len(w) + 1 > 40:
                break
            truncated.append(w)
            length += len(w) + 1
        name = " ".join(truncated) if truncated else name[:40]

    # Convert to Title Case if all upper or all lower
    if name.islower() or name.isupper():
        name = name.title()

    return name


def find_matching_folder(
    category_name: str,
    folders: list[dict],
    threshold: float = AI_FOLDER_SIMILARITY_THRESHOLD,
) -> Tuple[Optional[dict], float]:
    """Compare category_name against user's existing folders using exact and semantic similarity.
    Returns (matching_folder_dict, best_score).
    """
    if not folders or not category_name:
        return None, 0.0

    clean_category = sanitize_folder_name(category_name).lower()

    # 1. Exact or sub-string case-insensitive match check
    for f in folders:
        f_name_lower = f["name"].lower()
        if f_name_lower == clean_category:
            return f, 1.0
        # If category is "Career" and folder is "Career & Jobs" or vice versa
        if len(clean_category) > 2 and (clean_category in f_name_lower or f_name_lower in clean_category):
            return f, 0.95

    # 2. Semantic embedding match
    try:
        model = _get_model()
        # Build enriched representations of existing folders
        folder_texts = []
        for f in folders:
            rep = [f["name"]]
            if f.get("sample_filenames"):
                rep.extend(f["sample_filenames"])
            # Add semantic hints for common category names
            f_lower = f["name"].lower()
            if "career" in f_lower or "job" in f_lower or "work" in f_lower:
                rep.extend(["resume", "cv", "experience", "education", "skills", "application", "portfolio"])
            elif "bill" in f_lower or "finance" in f_lower or "invoice" in f_lower or "tax" in f_lower:
                rep.extend(["receipt", "payment", "bank", "statement", "accounting", "utility"])
            elif "project" in f_lower or "code" in f_lower or "dev" in f_lower:
                rep.extend(["software", "repo", "script", "assignment", "build"])
            elif "personal" in f_lower or "doc" in f_lower:
                rep.extend(["passport", "id", "certificate", "medical", "letter"])

            folder_texts.append(" | ".join(rep))

        cat_vec = model.encode([category_name], normalize_embeddings=True)[0]
        folder_vecs = model.encode(folder_texts, normalize_embeddings=True)

        best_folder = None
        best_score = -1.0
        for i, vec in enumerate(folder_vecs):
            score = float(_cosine_similarity(cat_vec, vec))
            if score > best_score:
                best_score = score
                best_folder = folders[i]

        if best_folder and best_score >= threshold:
            logger.info("Matched folder '%s' with similarity %.2f for category '%s'", best_folder["name"], best_score, category_name)
            return best_folder, best_score
        else:
            logger.info("No existing folder met threshold %.2f for category '%s' (best: %.2f)", threshold, category_name, max(best_score, 0.0))
            return None, max(best_score, 0.0)

    except Exception as exc:
        logger.warning("Semantic matching fallback to simple string matching due to model issue: %s", exc)

        # Fallback string token overlap
        cat_words = set(clean_category.split())
        for f in folders:
            f_words = set(f["name"].lower().split())
            if cat_words & f_words:
                return f, 0.60

        return None, 0.0


def get_or_create_recommended_folder(
    db: Session,
    *,
    owner_id: uuid.UUID,
    category_name: str,
    folders: list[dict],
    threshold: float = AI_FOLDER_SIMILARITY_THRESHOLD,
    parent_id: Optional[uuid.UUID] = None,
) -> Tuple[dict, bool, float]:
    """Returns (folder_dict, is_newly_created, score).
    If a suitable existing folder is found, returns it with is_newly_created=False.
    Otherwise, creates a new concise folder for the user and returns is_newly_created=True.
    """
    clean_name = sanitize_folder_name(category_name)

    # 1. Try to find a matching existing folder
    matched_folder, score = find_matching_folder(clean_name, folders, threshold=threshold)
    if matched_folder is not None:
        return matched_folder, False, score

    # 2. If no folder matched and auto-creation is disabled, use best fallback folder or first
    if not AI_AUTO_CREATE_FOLDERS:
        if folders:
            return folders[0], False, score
        raise ValueError("No folders exist and folder auto-creation is disabled.")

    # 3. Double-check for exact name conflict among existing folders to prevent duplicates
    for f in folders:
        if f["name"].strip().lower() == clean_name.lower():
            return f, False, 1.0

    # 4. Create the new folder using existing files.service.create_folder
    logger.info("Creating new folder '%s' for user=%s", clean_name, owner_id)
    try:
        new_folder_entity = files_service.create_folder(
            db, owner_id=owner_id, name=clean_name, parent_id=parent_id
        )
        new_folder_dict = {
            "id": new_folder_entity.id,
            "name": new_folder_entity.name,
            "sample_filenames": [],
            "file_count": 0,
        }
        # Update current user folder list in memory
        folders.append(new_folder_dict)
        return new_folder_dict, True, 1.0
    except Exception as exc:
        logger.error("Failed to create folder '%s' for user %s: %s", clean_name, owner_id, exc)
        # If folder creation fails, fallback to an existing folder if possible
        if folders:
            return folders[0], False, 0.0
        raise
