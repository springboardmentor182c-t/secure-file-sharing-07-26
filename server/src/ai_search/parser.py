from pathlib import Path

from pypdf import PdfReader

from docx import Document


def read_pdf(path: str):

    reader = PdfReader(path)

    text = ""

    for page in reader.pages:

        extracted = page.extract_text()

        if extracted:

            text += extracted + "\n"

    return text


def read_docx(path: str):

    doc = Document(path)

    return "\n".join([p.text for p in doc.paragraphs])


def read_txt(path: str):

    with open(path, "r", encoding="utf-8") as file:

        return file.read()


def extract_text(file_path: str):

    ext = Path(file_path).suffix.lower()

    if ext == ".pdf":
        return read_pdf(file_path)

    if ext == ".docx":
        return read_docx(file_path)

    if ext == ".txt":
        return read_txt(file_path)

    raise Exception("Unsupported File Type")