import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File as FastAPIFile,
    Form,
    UploadFile,
    HTTPException,
    Response,
)

from sqlalchemy.orm import Session

from src.database.core import get_db
from src.todos import service


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/files",
    tags=["File Management"]
)


# =====================================================
# GET ALL FILES
# =====================================================

@router.get("")
def get_all_files(
    owner_id: uuid.UUID,
    folder_id: uuid.UUID | None = None,
    db: Session = Depends(get_db)
):
    return service.get_files(
        db=db,
        owner_id=owner_id,
        folder_id=folder_id
    )


# =====================================================
# FOLDER ROUTES
# Keep folder routes before /{file_id}
# =====================================================


# =====================================================
# GET ALL FOLDERS
# =====================================================

@router.get("/folders")
def get_all_folders(
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    return service.get_folders(
        db=db,
        owner_id=owner_id
    )


# =====================================================
# CREATE FOLDER
# =====================================================

@router.post("/folders")
def create_new_folder(
    owner_id: uuid.UUID,
    folder_name: str,
    description: str | None = None,
    parent_folder_id: uuid.UUID | None = None,
    db: Session = Depends(get_db)
):
    return service.create_folder(
        db=db,
        owner_id=owner_id,
        folder_name=folder_name,
        description=description,
        parent_folder_id=parent_folder_id
    )


# =====================================================
# RENAME FOLDER
# =====================================================

@router.put("/folders/{folder_id}/rename")
def rename_existing_folder(
    folder_id: uuid.UUID,
    owner_id: uuid.UUID,
    new_name: str,
    db: Session = Depends(get_db)
):
    return service.rename_folder(
        db=db,
        folder_id=folder_id,
        owner_id=owner_id,
        new_name=new_name
    )


# =====================================================
# DELETE FOLDER
# =====================================================

@router.delete("/folders/{folder_id}")
def delete_existing_folder(
    folder_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    service.delete_folder(
        db=db,
        folder_id=folder_id,
        owner_id=owner_id
    )

    return {
        "message": "Folder deleted successfully"
    }


# =====================================================
# UPLOAD NEW FILE
# =====================================================

@router.post("/upload")
def upload_new_file(
    owner_id: uuid.UUID = Form(...),
    folder_id: str | None = Form(None),
    uploaded_file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db)
):
    try:
        parsed_folder_id = None

        if folder_id:
            try:
                parsed_folder_id = uuid.UUID(
                    folder_id
                )

            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid folder ID"
                )

        return service.upload_file(
            db=db,
            uploaded_file=uploaded_file,
            owner_id=owner_id,
            folder_id=parsed_folder_id
        )

    except HTTPException:
        raise

    except Exception as e:
        print(
            "UPLOAD ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="File upload failed"
        )


# =====================================================
# PREVIEW FILE
# =====================================================

@router.get("/{file_id}/preview")
def preview_file(
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    file_record = service.get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    file_path = Path(
        file_record.storage_path
    )

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Physical file not found"
        )

    try:
        with open(file_path, "rb") as f:
            content = f.read()

    except Exception as e:
        print(
            "PREVIEW ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to preview file"
        )

    return Response(
        content=content,
        media_type=(
            file_record.mime_type
            or "application/octet-stream"
        ),
        headers={
            "Content-Disposition":
                f'inline; filename="{file_record.file_name}"'
        }
    )


# =====================================================
# DOWNLOAD CURRENT FILE
# =====================================================

@router.get("/{file_id}/download")
def download_file(
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    file_record = service.get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    file_path = Path(
        file_record.storage_path
    )

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Physical file not found"
        )

    try:
        with open(file_path, "rb") as f:
            content = f.read()

    except Exception as e:
        print(
            "DOWNLOAD ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to download file"
        )

    return Response(
        content=content,
        media_type=(
            file_record.mime_type
            or "application/octet-stream"
        ),
        headers={
            "Content-Disposition":
                f'attachment; filename="{file_record.file_name}"'
        }
    )


# =====================================================
# FILE VERSION ROUTES
# =====================================================


# =====================================================
# GET ALL VERSIONS OF FILE
# =====================================================

@router.get("/{file_id}/versions")
def get_file_versions(
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    return service.get_file_versions(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )


# =====================================================
# UPLOAD NEW VERSION
# =====================================================

@router.post("/{file_id}/versions")
def upload_file_version(
    file_id: uuid.UUID,
    owner_id: uuid.UUID = Form(...),
    uploaded_file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db)
):
    try:
        return service.upload_new_version(
            db=db,
            file_id=file_id,
            uploaded_file=uploaded_file,
            owner_id=owner_id
        )

    except HTTPException:
        raise

    except Exception as e:
        print(
            "VERSION UPLOAD ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to upload new version"
        )


# =====================================================
# DOWNLOAD SPECIFIC VERSION
# =====================================================

@router.get(
    "/{file_id}/versions/{version_id}/download"
)
def download_file_version(
    file_id: uuid.UUID,
    version_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    version = service.get_file_version_by_id(
        db=db,
        file_id=file_id,
        version_id=version_id,
        owner_id=owner_id
    )

    # Get main file information for filename/MIME type
    file_record = service.get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    file_path = Path(
        version.storage_path
    )

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Version file not found"
        )

    try:
        with open(file_path, "rb") as f:
            content = f.read()

    except Exception as e:
        print(
            "VERSION DOWNLOAD ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to download version"
        )

    download_name = (
        f"v{version.version_number}_"
        f"{file_record.file_name}"
    )

    return Response(
        content=content,
        media_type=(
            file_record.mime_type
            or "application/octet-stream"
        ),
        headers={
            "Content-Disposition":
                f'attachment; filename="{download_name}"'
        }
    )


# =====================================================
# GET ONE FILE
# =====================================================

@router.get("/{file_id}")
def get_file_details(
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    return service.get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )


# =====================================================
# RENAME FILE
# =====================================================

@router.put("/{file_id}/rename")
def rename_existing_file(
    file_id: uuid.UUID,
    new_name: str,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    return service.rename_file(
        db=db,
        file_id=file_id,
        owner_id=owner_id,
        new_name=new_name
    )


# =====================================================
# DELETE FILE
# =====================================================

@router.delete("/{file_id}")
def delete_existing_file(
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    service.delete_file(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    return {
        "message": "File deleted successfully"
    }

# =====================================================
# GET FILE VERSIONS
# =====================================================

@router.get("/{file_id}/versions")
def get_versions(
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    return service.get_file_versions(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

# =====================================================
# UPLOAD NEW FILE VERSION
# =====================================================

@router.post("/{file_id}/versions")
def upload_file_version(
    file_id: uuid.UUID,
    owner_id: uuid.UUID = Form(...),
    uploaded_file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db)
):
    try:

        return service.upload_new_version(
            db=db,
            file_id=file_id,
            owner_id=owner_id,
            uploaded_file=uploaded_file
        )

    except HTTPException:
        raise

    except Exception as e:

        print(
            "VERSION UPLOAD ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Version upload failed"
        )