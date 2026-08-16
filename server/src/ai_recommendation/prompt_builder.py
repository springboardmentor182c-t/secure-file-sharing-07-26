"""Builds the structured prompt sent to Grok. No fabricated data - every
section here is either real request data or is omitted entirely."""
from typing import Optional


SYSTEM_PROMPT = (
    "You are an AI file-organization assistant for a secure file sharing app. "
    "Analyze the uploaded document's filename, extension, type, keywords, and extracted content. "
    "Determine the most appropriate, concise, reusable folder category for this file. "
    "Look at the list of existing folders (if any). If an existing folder is semantically appropriate, "
    "use that existing folder's name/ID. Otherwise, generate a concise new category name (e.g. 'Career', 'Machine Learning Research', 'Financial Documents'). "
    "Respond with ONLY a JSON object matching this exact shape: "
    '{"category_name": "<concise folder/category name>", "recommended_folder_id": "<ID if existing folder matched, else null>", '
    '"confidence": <number between 0 and 1>, "reason": "<short justification>"}.'
)


def build_folder_context_block(folders: list[dict]) -> str:
    lines = ["Available folders:"]
    for f in folders:
        sample = ", ".join(f["sample_filenames"][:8]) if f.get("sample_filenames") else "(empty folder)"
        lines.append(f'- ID: {f["id"]} | Name: "{f["name"]}" | Existing files: {sample}')
    return "\n".join(lines)


def build_history_block(history: list[dict]) -> Optional[str]:
    """`history` is real prior upload->folder pairs for this user (e.g. by
    matching extension or filename similarity). Returns None if there is no
    real history to include - the section is omitted entirely rather than
    faked."""
    if not history:
        return None
    lines = ["Relevant previous uploads by this user (real activity):"]
    for h in history[:10]:
        lines.append(f'- "{h["filename"]}" was placed in folder "{h["folder_name"]}" (ID: {h["folder_id"]})')
    return "\n".join(lines)


def build_user_prompt(
    *,
    filename: str,
    extension: str,
    mime_type: str,
    size: int,
    extracted_content: str,
    folders: list[dict],
    history: list[dict],
) -> str:
    sections = [
        "File information:",
        f"- Filename: {filename}",
        f"- Extension: {extension or '(none)'}",
        f"- MIME type: {mime_type}",
        f"- Size (bytes): {size}",
        "",
    ]

    if extracted_content:
        sections += ["Extracted file content (may be truncated):", extracted_content, ""]
    else:
        sections += ["Extracted file content: (not available for this file type - use filename/extension/MIME type only)", ""]

    sections += [build_folder_context_block(folders), ""]

    history_block = build_history_block(history)
    if history_block:
        sections += [history_block, ""]

    sections.append(
        "Determine the single best folder category for this file, and respond with ONLY the JSON object."
    )
    return "\n".join(sections)

