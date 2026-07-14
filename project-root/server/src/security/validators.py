from pathlib import Path
from fastapi import HTTPException, UploadFile, status

# Configuration

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

ALLOWED_EXTENSIONS = {
    ".txt",
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".webp",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".csv",
    ".zip",
    ".rar",
    ".7z",
    ".mp4",
    ".mp3",
    ".wav",
    ".json",
    ".xml",
}

ALLOWED_MIME_TYPES = {
    "text/plain",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/bmp",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/csv",
    "application/json",
    "application/xml",
    "text/xml",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-zip-compressed",
    "application/octet-stream",
    "video/mp4",
    "audio/mpeg",
    "audio/wav",
}


# Upload Validation


def validate_upload(
    upload: UploadFile,
    file_size: int,
):

    # Empty filename

    if not upload.filename:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )

    # Empty file

    if file_size == 0:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty files are not allowed.",
        )

    # Maximum size

    if file_size > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds maximum allowed size.",
        )

    extension = Path(upload.filename).suffix.lower()

    # Extension validation

    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{extension} files are not allowed.",
        )

    # MIME validation

    if upload.content_type and upload.content_type not in ALLOWED_MIME_TYPES:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type.",
        )

    return True
