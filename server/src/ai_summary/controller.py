"""
API routes for the AI File Summary feature.

GET  /api/ai-summary/files                     -> list all files (for the AI Summary page)
POST /api/ai-summary/files/{file_id}/summary    -> trigger generation
GET  /api/ai-summary/files/{file_id}/summary    -> fetch current status/result
"""

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.entities.file import File
from src.ai_summary.models import GenerateSummaryResponse, SummaryResponse, FileListItem
from src.ai_summary.service import FileSummaryService

router = APIRouter(prefix="/api/ai-summary", tags=["AI Summary"])


@router.get("/files", response_model=list[FileListItem])
def list_files(db: Session = Depends(get_db)):
    """
    Lists all non-deleted files, so the AI Summary page can show
    a real, dynamic list of files to summarize.
    """
    files = (
        db.query(File)
        .filter(File.is_deleted == False)  # noqa: E712
        .order_by(File.uploaded_at.desc())
        .all()
    )
    return files


@router.post("/files/{file_id}/summary", response_model=GenerateSummaryResponse)
async def generate_summary(
    file_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    file = (
        db.query(File)
        .filter(File.id == file_id, File.is_deleted == False)  # noqa: E712
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    service = FileSummaryService(db)
    existing = service.get_summary(file_id)

    if existing and existing.status == "completed":
        return GenerateSummaryResponse(status="completed", message="Summary already exists")

    if existing and existing.status == "pending":
        return GenerateSummaryResponse(status="pending", message="Summary generation already in progress")

    service.start_generation(file_id)
    background_tasks.add_task(
        service.process_summary,
        file_id,
        file.storage_path,
        file.encrypted_path,
    )

    return GenerateSummaryResponse(status="pending", message="Summary generation started")


@router.get("/files/{file_id}/summary", response_model=SummaryResponse)
def get_summary(file_id: str, db: Session = Depends(get_db)):
    service = FileSummaryService(db)
    row = service.get_summary(file_id)

    if not row:
        return SummaryResponse(status="not_generated")

    return SummaryResponse(
        status=row.status,
        summary=row.summary if row.status == "completed" else None,
        model_used=row.model_used,
        generated_at=row.generated_at,
    )