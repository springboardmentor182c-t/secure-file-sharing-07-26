"""
Files + Folders API routes (My Files screen).

Route summary
-------------
POST   /files                    upload a file (multipart)
GET    /files                    search/filter/sort/paginate (non-trashed)
GET    /files/trash              list files currently in Trash
GET    /files/storage-stats      used/total/remaining bytes, file & folder counts
GET    /files/{id}               get one file's metadata
GET    /files/{id}/download      download (decrypted) file bytes
PATCH  /files/{id}/rename        rename
PATCH  /files/{id}/move          move to another folder (or root)
PATCH  /files/{id}/category      change category tag
POST   /files/{id}/star          toggle starred
DELETE /files/{id}               soft delete (-> Trash)
POST   /files/{id}/restore       restore out of Trash
DELETE /files/{id}/permanent     permanently delete (DB row + storage blob)

POST   /folders                  create
GET    /folders                  list (optional ?parent_id=)
PATCH  /folders/{id}             rename
DELETE /folders/{id}             delete (must have no subfolders; contained
                                  files move to root, they are not deleted)

Sharing integration: this module does NOT implement its own shared-link
creation. The frontend calls the existing `POST /shared-links` endpoint
(see src/shared_links/controller.py) directly with a `file_id` from here -
no duplicate API, no duplicate service.
"""
import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File as FastAPIFile, Form, Query, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.dependencies import get_current_user_id
from src.files import service
from src.files.constants import DEFAULT_PAGE_SIZE, FileCategory, SortField
from src.files.models import (
    FileCategoryUpdateRequest,
    FileMoveRequest,
    FileRead,
    FileRenameRequest,
    FolderCreate,
    FolderRead,
    FolderRename,
    StorageStatsRead,
)
from src.pagination import build_pagination_meta
from src.schemas import ApiResponse, PaginatedResponse

router = APIRouter(prefix="/files", tags=["Files"])
folders_router = APIRouter(prefix="/folders", tags=["Folders"])


def _folder_read(entry: dict) -> FolderRead:
    folder = entry["folder"]
    return FolderRead(
        id=folder.id, owner_id=folder.owner_id, parent_id=folder.parent_id,
        name=folder.name, created_at=folder.created_at, updated_at=folder.updated_at,
        file_count=entry["file_count"],
    )


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------


@router.post("", response_model=ApiResponse[FileRead], status_code=201, summary="Upload a file")
async def upload_file(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    upload: UploadFile = FastAPIFile(...),
    folder_id: Optional[uuid.UUID] = Form(default=None),
    category: FileCategory = Form(default=FileCategory.OTHER),
):
    contents = await upload.read()
    file_obj = service.upload_file(
        db, owner_id=owner_id, filename=upload.filename, content_type=upload.content_type,
        contents=contents, folder_id=folder_id, category=category,
    )
    return ApiResponse(message="File uploaded", data=service.serialize_file(file_obj))


# ---------------------------------------------------------------------------
# List / search
# ---------------------------------------------------------------------------


@router.get("", response_model=PaginatedResponse[FileRead], summary="Search/filter/sort/paginate")
def list_files(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    search: Optional[str] = Query(default=None),
    category: Optional[FileCategory] = Query(default=None),
    folder_id: Optional[uuid.UUID] = Query(default=None),
    starred: bool = Query(default=False),
    sort_by: SortField = Query(default=SortField.NEWEST, alias="sort"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=100),
):
    files, total = service.search_files(
        db, owner_id=owner_id, search=search, category=category, folder_id=folder_id,
        starred_only=starred, trashed_only=False, sort_by=sort_by, page=page, page_size=page_size,
    )
    return PaginatedResponse(
        data=service.list_files_for_response(files),
        pagination=build_pagination_meta(page, page_size, total),
    )


@router.get("/trash", response_model=PaginatedResponse[FileRead], summary="List files in Trash")
def list_trash(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=100),
):
    files, total = service.search_files(
        db, owner_id=owner_id, trashed_only=True, sort_by=SortField.NEWEST, page=page, page_size=page_size,
    )
    return PaginatedResponse(
        data=service.list_files_for_response(files),
        pagination=build_pagination_meta(page, page_size, total),
    )


@router.get("/storage-stats", response_model=ApiResponse[StorageStatsRead], summary="Storage usage")
def storage_stats(owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    stats = service.get_storage_stats(db, owner_id)
    return ApiResponse(data=StorageStatsRead(**stats))


@router.get("/{file_id}", response_model=ApiResponse[FileRead], summary="Get one file's metadata")
def get_file(file_id: uuid.UUID, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    file_obj = service.get_owned_file(db, file_id=file_id, owner_id=owner_id)
    return ApiResponse(data=service.serialize_file(file_obj))


@router.get("/{file_id}/download", summary="Download the (decrypted) file")
def download_file(file_id: uuid.UUID, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    filename, mime_type, data = service.download_file(db, file_id=file_id, owner_id=owner_id)
    return Response(
        content=data,
        media_type=mime_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# Mutations
# ---------------------------------------------------------------------------


@router.patch("/{file_id}/rename", response_model=ApiResponse[FileRead], summary="Rename a file")
def rename_file(
    file_id: uuid.UUID, payload: FileRenameRequest,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)],
):
    file_obj = service.rename_file(db, file_id=file_id, owner_id=owner_id, new_name=payload.name)
    return ApiResponse(message="File renamed", data=service.serialize_file(file_obj))


@router.patch("/{file_id}/move", response_model=ApiResponse[FileRead], summary="Move a file to another folder")
def move_file(
    file_id: uuid.UUID, payload: FileMoveRequest,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)],
):
    file_obj = service.move_file(db, file_id=file_id, owner_id=owner_id, folder_id=payload.folder_id)
    return ApiResponse(message="File moved", data=service.serialize_file(file_obj))


@router.patch("/{file_id}/category", response_model=ApiResponse[FileRead], summary="Change a file's category")
def set_category(
    file_id: uuid.UUID, payload: FileCategoryUpdateRequest,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)],
):
    file_obj = service.set_category(db, file_id=file_id, owner_id=owner_id, category=payload.category)
    return ApiResponse(message="Category updated", data=service.serialize_file(file_obj))


@router.post("/{file_id}/star", response_model=ApiResponse[FileRead], summary="Toggle starred")
def toggle_star(file_id: uuid.UUID, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    file_obj = service.toggle_star(db, file_id=file_id, owner_id=owner_id)
    return ApiResponse(message="Starred" if file_obj.is_starred else "Unstarred", data=service.serialize_file(file_obj))


@router.delete("/{file_id}", response_model=ApiResponse[FileRead], summary="Move a file to Trash")
def delete_file(file_id: uuid.UUID, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    file_obj = service.delete_file(db, file_id=file_id, owner_id=owner_id)
    return ApiResponse(message="Moved to Trash", data=service.serialize_file(file_obj))


@router.post("/{file_id}/restore", response_model=ApiResponse[FileRead], summary="Restore a file out of Trash")
def restore_file(file_id: uuid.UUID, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    file_obj = service.restore_file(db, file_id=file_id, owner_id=owner_id)
    return ApiResponse(message="File restored", data=service.serialize_file(file_obj))


@router.delete("/{file_id}/permanent", response_model=ApiResponse[None], summary="Permanently delete a file")
def permanently_delete_file(file_id: uuid.UUID, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    service.permanently_delete_file(db, file_id=file_id, owner_id=owner_id)
    return ApiResponse(message="File permanently deleted", data=None)


# ---------------------------------------------------------------------------
# Folders
# ---------------------------------------------------------------------------


@folders_router.post("", response_model=ApiResponse[FolderRead], status_code=201, summary="Create a folder")
def create_folder(payload: FolderCreate, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    folder = service.create_folder(db, owner_id=owner_id, name=payload.name, parent_id=payload.parent_id)
    return ApiResponse(message="Folder created", data=_folder_read({"folder": folder, "file_count": 0}))


@folders_router.get("", response_model=ApiResponse[list[FolderRead]], summary="List folders")
def list_folders(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)],
    parent_id: Optional[uuid.UUID] = Query(default=None),
):
    entries = service.list_folders(db, owner_id=owner_id, parent_id=parent_id)
    return ApiResponse(data=[_folder_read(e) for e in entries])


@folders_router.patch("/{folder_id}", response_model=ApiResponse[FolderRead], summary="Rename a folder")
def rename_folder(
    folder_id: uuid.UUID, payload: FolderRename,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)],
):
    folder = service.rename_folder(db, folder_id=folder_id, owner_id=owner_id, name=payload.name)
    file_count = service.count_files_in_folder(db, owner_id=owner_id, folder_id=folder_id)
    return ApiResponse(message="Folder renamed", data=_folder_read({"folder": folder, "file_count": file_count}))


@folders_router.delete("/{folder_id}", response_model=ApiResponse[None], summary="Delete a folder")
def delete_folder(folder_id: uuid.UUID, owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    service.delete_folder(db, folder_id=folder_id, owner_id=owner_id)
    return ApiResponse(message="Folder deleted", data=None)
