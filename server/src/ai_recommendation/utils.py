"""
File-content extraction for the AI recommendation feature.

Best-effort, defensive text extraction. Never raises - any failure just
means we fall back to filename/extension/MIME-type context instead of
crashing the recommendation (or the upload) flow.
"""
import csv
import io
import json
import logging

from src.ai_recommendation.config import AI_MAX_CONTENT_CHARS

logger = logging.getLogger("app.ai_recommendation")

TEXT_LIKE_EXTENSIONS = {"txt", "md", "log", "yaml", "yml", "xml", "sql", "rtf"}


def extract_text_content(*, filename: str, extension: str, mime_type: str, contents: bytes) -> str:
    """Return a best-effort text excerpt of `contents`, truncated to
    AI_MAX_CONTENT_CHARS. Returns "" if nothing could be extracted (the
    caller still has filename/extension/MIME-type to work with)."""
    ext = (extension or "").lower().lstrip(".")

    try:
        if ext == "pdf":
            text = _extract_pdf(contents)
        elif ext == "docx":
            text = _extract_docx(contents)
        elif ext == "csv":
            text = _extract_csv(contents)
        elif ext == "json":
            text = _extract_json(contents)
        elif ext in TEXT_LIKE_EXTENSIONS or mime_type.startswith("text/"):
            text = _decode_text(contents)
        else:
            text = ""
    except Exception:
        logger.warning("AI recommendation: content extraction failed for %s (.%s)", filename, ext, exc_info=True)
        text = ""

    return _truncate(text)


def _truncate(text: str) -> str:
    text = (text or "").strip()
    if len(text) <= AI_MAX_CONTENT_CHARS:
        return text
    # Keep the head (title/intro is usually most informative) and a slice
    # of the tail, rather than a hard cut that only ever sees the start.
    head_len = int(AI_MAX_CONTENT_CHARS * 0.8)
    tail_len = AI_MAX_CONTENT_CHARS - head_len
    return f"{text[:head_len]}\n...[truncated]...\n{text[-tail_len:]}"


def _decode_text(contents: bytes) -> str:
    for encoding in ("utf-8", "latin-1"):
        try:
            return contents.decode(encoding)
        except (UnicodeDecodeError, LookupError):
            continue
    return ""


def _extract_pdf(contents: bytes) -> str:
    reader_cls = None
    try:
        from pypdf import PdfReader
        reader_cls = PdfReader
        logger.info("AI recommendation: using pypdf for PDF text extraction")
    except ImportError:
        try:
            from PyPDF2 import PdfReader
            reader_cls = PdfReader
            logger.info("AI recommendation: PyPDF2 installed, using it for PDF text extraction")
        except ImportError:
            logger.debug("AI recommendation: pypdf/PyPDF2 not installed, skipping PDF text extraction")
            return ""

    reader = reader_cls(io.BytesIO(contents))
    pages = []
    # Cap pages scanned so a huge PDF can't stall the request.
    for page in reader.pages[:30]:
        try:
            pages.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(pages)


def _extract_docx(contents: bytes) -> str:
    try:
        import docx
    except ImportError:
        logger.info("AI recommendation: python-docx not installed, skipping DOCX text extraction")
        return ""

    document = docx.Document(io.BytesIO(contents))
    return "\n".join(p.text for p in document.paragraphs if p.text)


def _extract_csv(contents: bytes) -> str:
    text = _decode_text(contents)
    if not text:
        return ""
    reader = csv.reader(io.StringIO(text))
    rows = []
    for i, row in enumerate(reader):
        if i >= 50:  # header + a sample of rows is plenty of signal
            break
        rows.append(", ".join(row))
    return "\n".join(rows)


def _extract_json(contents: bytes) -> str:
    text = _decode_text(contents)
    if not text:
        return ""
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return text  # not valid JSON - just treat it as plain text
    return json.dumps(parsed, indent=2)[: AI_MAX_CONTENT_CHARS * 2]
