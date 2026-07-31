"""
Extracts plain text from files so it can be sent to the AI model
for summarization. Supports pdf, docx, and txt for now.
"""

import os

import pdfplumber
from docx import Document

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def is_supported(file_extension: str) -> bool:
    ext = file_extension.lower()
    if not ext.startswith("."):
        ext = f".{ext}"
    return ext in SUPPORTED_EXTENSIONS


def extract_text(file_path: str) -> str:
    """
    Extract plain text from a file based on its extension.
    Raises ValueError for unsupported types or FileNotFoundError if missing.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found on disk: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _extract_from_pdf(file_path)
    elif ext == ".docx":
        return _extract_from_docx(file_path)
    elif ext == ".txt":
        return _extract_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type for summarization: {ext}")


def _extract_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def _extract_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs).strip()


def _extract_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read().strip()