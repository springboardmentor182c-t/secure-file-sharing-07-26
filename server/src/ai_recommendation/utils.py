"""
Small, dependency-isolated helper functions: file-metadata extraction,
best-effort text extraction (PDF / DOCX / TXT / Markdown), whitespace
normalization, lightweight extractive summarization, frequency-based
keyword extraction, text truncation, and tolerant JSON parsing of the
Gemini response.

Every extractor is defensive by design: a corrupt/unsupported file must
never raise past this module during a recommendation request - it should
degrade to "no extractable text" instead, since the recommendation must
never block or fail the upload.
"""
import json
import logging
import re
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional

logger = logging.getLogger("app.ai_recommendation")

# Extensions (without the dot) we attempt real text extraction for. Images
# and everything else fall back to filename-only signal, per spec.
TEXT_EXTRACTABLE_EXTENSIONS = {"pdf", "txt", "docx", "md", "markdown", "csv"}
IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tiff"}

# A small, generic English stopword list - enough to keep frequency-based
# keyword extraction useful without pulling in a heavy NLP dependency.
_STOPWORDS = frozenset(
    """
    a an the and or but if then else for while with without within into onto
    of to in on at by from as is are was were be been being this that these
    those it its it's i you he she we they them his her our your their my me
    us do does did doing have has had having not no nor so than too very can
    will would shall should may might must about above after again against
    all am below between both down during each few further here how more
    most other over own same some such under until up when where which who
    whom why page pages document file report copy dated page1 attachment
    """.split()
)

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
_WORD_RE = re.compile(r"[A-Za-z][A-Za-z0-9\-]{2,}")
_WHITESPACE_RE = re.compile(r"\s+")


@dataclass(frozen=True)
class FileMetadata:
    filename: str
    extension: str
    mime_type: str
    size_bytes: int
    uploaded_at: datetime


def build_file_metadata(filename: str, content_type: Optional[str], size_bytes: int) -> FileMetadata:
    safe_name = (filename or "unnamed").strip()
    extension = safe_name.rsplit(".", 1)[-1].lower() if "." in safe_name else ""
    return FileMetadata(
        filename=safe_name,
        extension=extension,
        mime_type=(content_type or "application/octet-stream"),
        size_bytes=size_bytes,
        uploaded_at=datetime.now(timezone.utc),
    )


def is_text_extractable(extension: str) -> bool:
    return extension.lower() in TEXT_EXTRACTABLE_EXTENSIONS


def is_image(extension: str) -> bool:
    return extension.lower() in IMAGE_EXTENSIONS


def normalize_whitespace(text: str) -> str:
    """Collapse repeated whitespace/newlines into single spaces so
    extracted text is clean before summarization/embedding."""
    if not text:
        return ""
    return _WHITESPACE_RE.sub(" ", text).strip()


def truncate_text(text: str, max_chars: int) -> str:
    """Extract only the first reasonable portion of a document so we never
    send an entire large document to Gemini or the embedding model
    (spec: Performance / "Limit extremely large documents")."""
    if not text:
        return ""
    text = text.strip()
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(" ", 1)[0] + " …[truncated]"


def generate_summary(text: str, max_sentences: int = 3, max_chars: int = 500) -> str:
    """Lightweight, deterministic extractive summary (first N sentences of
    the normalized text). Intentionally does not call any AI model for
    this step - it only feeds the embedding model and the Gemini prompt,
    so a fast/free/offline approach keeps latency and cost down."""
    normalized = normalize_whitespace(text)
    if not normalized:
        return ""
    sentences = _SENTENCE_SPLIT_RE.split(normalized)
    summary = " ".join(s.strip() for s in sentences[:max_sentences] if s.strip())
    return truncate_text(summary, max_chars)


def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    """Simple frequency-based keyword extraction (stopword-filtered,
    length-filtered). No external NLP dependency - good enough to give
    Gemini/the folder representation a compact topical signal."""
    normalized = normalize_whitespace(text).lower()
    if not normalized:
        return []
    words = [w for w in _WORD_RE.findall(normalized) if w not in _STOPWORDS]
    if not words:
        return []
    counts = Counter(words)
    return [word for word, _ in counts.most_common(top_n)]


def extract_text_from_txt_or_md(contents: bytes, max_chars: int) -> str:
    try:
        text = contents.decode("utf-8", errors="ignore")
    except Exception as exc:  # pragma: no cover - decode(errors="ignore") essentially never raises
        logger.warning("Text decode failed: %s", exc)
        return ""
    return truncate_text(normalize_whitespace(text), max_chars)


def extract_text_from_pdf(contents: bytes, max_chars: int) -> str:
    try:
        from pypdf import PdfReader  # local import: optional dependency
    except ImportError:
        logger.info("pypdf not installed - skipping PDF text extraction, falling back to filename-only signal")
        return ""

    try:
        import io
        reader = PdfReader(io.BytesIO(contents))
        chunks: list[str] = []
        total_len = 0
        for page in reader.pages:
            page_text = (page.extract_text() or "").strip()
            if page_text:
                chunks.append(page_text)
                total_len += len(page_text)
            if total_len >= max_chars:
                break  # don't parse the entire large document, just enough
        return truncate_text(normalize_whitespace("\n".join(chunks)), max_chars)
    except Exception as exc:
        logger.warning("PDF text extraction failed (non-fatal): %s", exc)
        return ""


def extract_text_from_docx(contents: bytes, max_chars: int) -> str:
    try:
        import docx  # python-docx, local import: optional dependency
    except ImportError:
        logger.info("python-docx not installed - skipping DOCX text extraction, falling back to filename-only signal")
        return ""

    try:
        import io
        document = docx.Document(io.BytesIO(contents))
        chunks: list[str] = []
        total_len = 0
        for paragraph in document.paragraphs:
            if paragraph.text.strip():
                chunks.append(paragraph.text.strip())
                total_len += len(paragraph.text)
            if total_len >= max_chars:
                break
        return truncate_text(normalize_whitespace("\n".join(chunks)), max_chars)
    except Exception as exc:
        logger.warning("DOCX text extraction failed (non-fatal): %s", exc)
        return ""


def extract_text_from_csv(contents: bytes, max_chars: int) -> str:
    """Reads a CSV as readable comma-joined rows (not raw bytes) so the
    embedding/Gemini prompt gets meaningful column values rather than
    delimiter noise. Bounded by max_chars, same as every other extractor."""
    try:
        text = contents.decode("utf-8", errors="ignore")
    except Exception as exc:  # pragma: no cover
        logger.warning("CSV decode failed: %s", exc)
        return ""

    try:
        import csv
        import io
        reader = csv.reader(io.StringIO(text))
        rows: list[str] = []
        total_len = 0
        for row in reader:
            line = ", ".join(cell.strip() for cell in row if cell and cell.strip())
            if not line:
                continue
            rows.append(line)
            total_len += len(line)
            if total_len >= max_chars:
                break
        return truncate_text(normalize_whitespace("\n".join(rows)), max_chars)
    except Exception as exc:
        logger.warning("CSV text extraction failed (non-fatal): %s", exc)
        return ""


def extract_text_content(extension: str, contents: bytes, max_chars: int) -> str:
    """Dispatch to the right extractor. Returns "" (never raises) for
    unsupported/empty/corrupt input - the caller treats that as
    "no extractable text" and proceeds with filename/extension signal only.
    """
    if not contents:
        return ""
    ext = extension.lower()
    if ext == "pdf":
        return extract_text_from_pdf(contents, max_chars)
    if ext == "docx":
        return extract_text_from_docx(contents, max_chars)
    if ext == "csv":
        return extract_text_from_csv(contents, max_chars)
    if ext in ("txt", "md", "markdown"):
        return extract_text_from_txt_or_md(contents, max_chars)
    return ""


_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def strip_code_fences(raw: str) -> str:
    """Gemini sometimes wraps JSON in ```json ... ``` even when told not
    to - strip that defensively before parsing."""
    return _CODE_FENCE_RE.sub("", raw or "").strip()


def try_parse_json_object(raw: str) -> Optional[dict]:
    """Tolerant JSON parse: strips code fences, and if there's leading/
    trailing prose around the JSON object, extracts the first {...} block.
    Returns None (never raises) on failure."""
    if not raw:
        return None
    cleaned = strip_code_fences(raw)
    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else None
    except (json.JSONDecodeError, TypeError):
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except (json.JSONDecodeError, TypeError):
        return None
