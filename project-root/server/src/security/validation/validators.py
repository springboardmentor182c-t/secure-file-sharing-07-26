from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from src.security.models.allowed_file_type import AllowedFileType
from src.security.services.config_service import get_config


def validate_upload(
    db: Session,
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

    max_file_size = int(
        get_config(
            db,
            "MAX_FILE_SIZE",
            "104857600",
        )
    )

    if file_size > max_file_size:

        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds maximum allowed size.",
        )

    extension = Path(upload.filename).suffix.lower()

    # Check allowed extension

    allowed_type = (
        db.query(AllowedFileType)
        .filter(
            AllowedFileType.extension == extension,
            AllowedFileType.is_active == True,
        )
        .first()
    )

    if not allowed_type:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{extension} files are not allowed.",
        )

    # MIME validation

    if upload.content_type and upload.content_type != allowed_type.mime_type:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type.",
        )

    return True
