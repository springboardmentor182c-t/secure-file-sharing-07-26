"""
Extracts plain text from file bytes so it can be sent to the AI model
for summarization. Supports pdf, docx, and txt for now.

Works entirely in-memory (BytesIO) because every real uploaded file is
AES-256-GCM encrypted on disk (see src/files/encryption.py) and only
exists as plaintext bytes after the caller has already decrypted it -
there is no plaintext path on disk to open directly.
"""

import io

import pdfplumber
from docx import Document

SUPPORTED_EXTENSIONS = {"pdf", "docx", "txt"}


def is_supported(extension: str) -> bool:
    return extension.lower().lstrip(".") in SUPPORTED_EXTENSIONS


def extract_text(data: bytes, extension: str) -> str:
    """
    Extract plain text from decrypted file bytes based on its extension.
    Raises ValueError for unsupported types.
    """
    ext = extension.lower().lstrip(".")

    if ext == "pdf":
        return _extract_from_pdf(data)
    elif ext == "docx":
        return _extract_from_docx(data)
    elif ext == "txt":
        return _extract_from_txt(data)
    else:
        raise ValueError(f"Unsupported file type for summarization: .{ext}")


def _extract_from_pdf(data: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def _extract_from_docx(data: bytes) -> str:
    doc = Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs).strip()


def _extract_from_txt(data: bytes) -> str:
    return data.decode("utf-8", errors="ignore").strip()