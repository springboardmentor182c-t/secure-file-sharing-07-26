"""Builds the exact prompt sent to Gemini for a folder recommendation."""
from typing import Dict, List, Sequence

from src.ai_recommendation.embedding_service import RankedCandidate
from src.ai_recommendation.schemas import FolderSummary, UploadHistoryEntry

# Above this many folders, only the Top-K candidates get their full
# dynamic description in the prompt (the rest are listed by name only) -
# keeps the prompt bounded for users with a large number of folders.
_FULL_DESCRIPTION_FOLDER_CAP = 8

_SYSTEM_INSTRUCTIONS = (
    "You are a file-organization assistant embedded in a secure file "
    "sharing application. Given information about a file the user is "
    "about to upload - including its extracted content, not just its "
    "filename - the user's existing folders (with dynamic descriptions "
    "of what each folder actually contains), semantic similarity scores "
    "from an embedding model, and the user's recent upload activity, "
    "recommend the single best destination folder.\n\n"
    "Rules:\n"
    "1. You MUST choose one folder from the \"Available folders\" list "
    "below - never invent a new folder name, never slightly alter an "
    "existing name, never return a folder that isn't listed.\n"
    "2. Prioritize the document's actual semantic meaning (extracted "
    "content summary + keywords) over the filename - a file named "
    "\"scan1.pdf\" whose content is clearly an invoice should still be "
    "recognized as an invoice.\n"
    "3. The \"Top semantic candidates\" are the folders an embedding model "
    "found most similar to this document's content, based on each "
    "folder's actual recent files and topics - strongly prefer one of "
    "these unless the extracted content or upload history clearly points "
    "elsewhere.\n"
    "4. Use the user's previous upload history and folder usage patterns "
    "as a tie-breaker when multiple folders seem plausible.\n"
    "5. confidence is an integer or float from 0 to 100 reflecting how "
    "certain you are.\n"
    "6. reason must be a single short sentence (max 200 characters) "
    "explaining what in the document's content (not just its name) led "
    "to this choice.\n\n"
    "Respond with STRICT JSON only - no markdown, no code fences, no "
    "commentary before or after. The response must be exactly this shape:\n"
    '{"recommended_folder": "<one of the available folders, verbatim>", '
    '"confidence": <number 0-100>, "reason": "<short explanation>"}'
)


def _format_available_folder_names(folders: Sequence[FolderSummary]) -> str:
    if not folders:
        return "(none - the user has no folders yet)"
    return ", ".join(f'"{f.name}"' for f in folders)


def _format_folder_descriptions(
    folders: Sequence[FolderSummary],
    folder_descriptions: Dict[str, str],
    top_candidate_names: Sequence[str],
) -> str:
    """Full dynamic description (name, recent filenames, keywords, recent
    summaries, upload counts) for the Top-K candidates always, plus every
    other folder too as long as the user doesn't have an unreasonably
    large number of them (kept bounded for prompt size)."""
    if not folders:
        return "(no folders yet)"

    top_set = set(top_candidate_names)
    show_all_full = len(folders) <= _FULL_DESCRIPTION_FOLDER_CAP

    lines: List[str] = []
    for folder in folders:
        description = folder_descriptions.get(folder.name, "")
        if folder.name in top_set or show_all_full:
            lines.append(f"- {description or f'Folder name: {folder.name}.'}")
        else:
            lines.append(f'- Folder name: {folder.name}. (description omitted for brevity)')
    return "\n".join(lines)


def _format_top_candidates(candidates: Sequence[RankedCandidate]) -> str:
    if not candidates:
        return "(no semantic candidates available - embedding engine did not run for this request)"
    lines = [f'- "{c.name}" (normalized similarity: {c.similarity:.2f})' for c in candidates]
    return "\n".join(lines)


def _format_history(history: Sequence[UploadHistoryEntry]) -> str:
    if not history:
        return "(no previous uploads)"
    lines: List[str] = []
    for entry in history:
        folder_part = f' -> folder "{entry.folder_name}"' if entry.folder_name else " -> Root"
        category_part = f" (category: {entry.category})" if entry.category else ""
        lines.append(f'- "{entry.filename}"{folder_part}{category_part}')
    return "\n".join(lines)


def _build_activity_summary(history: Sequence[UploadHistoryEntry]) -> str:
    if not history:
        return "No prior activity recorded for this user."
    folder_counts: dict[str, int] = {}
    for entry in history:
        key = entry.folder_name or "Root"
        folder_counts[key] = folder_counts.get(key, 0) + 1
    ranked = sorted(folder_counts.items(), key=lambda kv: kv[1], reverse=True)
    top = ", ".join(f"{name} ({count} file{'s' if count != 1 else ''})" for name, count in ranked[:5])
    return f"Most frequently used destinations recently (folder usage statistics): {top}."


def build_recommendation_prompt(
    *,
    filename: str,
    extension: str,
    mime_type: str,
    extracted_summary: str,
    keywords: Sequence[str],
    folders: Sequence[FolderSummary],
    folder_descriptions: Dict[str, str],
    top_candidates: Sequence[RankedCandidate],
    history: Sequence[UploadHistoryEntry],
) -> str:
    content_section = extracted_summary.strip() if extracted_summary else "(no extractable text - reason from filename/extension/mime type only)"
    keywords_section = ", ".join(keywords) if keywords else "(none extracted)"
    top_candidate_names = [c.name for c in top_candidates]

    return (
        f"{_SYSTEM_INSTRUCTIONS}\n\n"
        "---\n"
        f"Current uploaded filename: \"{filename}\"\n"
        f"File extension: \"{extension}\"\n"
        f"MIME type: \"{mime_type}\"\n"
        f"Extracted content summary:\n{content_section}\n\n"
        f"Keywords: {keywords_section}\n\n"
        f"Available folders (choose ONLY from this list, verbatim): {_format_available_folder_names(folders)}\n\n"
        f"Folder descriptions (dynamically built from each folder's real recent files):\n"
        f"{_format_folder_descriptions(folders, folder_descriptions, top_candidate_names)}\n\n"
        f"Top semantic candidates (from embedding cosine similarity, ranked):\n{_format_top_candidates(top_candidates)}\n\n"
        f"Previous upload history for this user (most recent first):\n{_format_history(history)}\n\n"
        f"{_build_activity_summary(history)}\n"
        "---\n"
        "Return the STRICT JSON response now."
    )
