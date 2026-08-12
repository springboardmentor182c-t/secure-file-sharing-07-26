"""
API routes for the AI File Summary feature.

POST /ai-summary/files/{file_id}/summary    -> trigger generation
GET  /ai-summary/files/{file_id}/summary    -> fetch current status/result

No separate file-listing endpoint here on purpose: the summary button
lives inside the My Files table (src/files), which already lists files.
This module only ever needs a file_id that's already on screen.
"""
import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.dependencies import get_current_user_id
from src.files import service as files_service
from src.ai_summary.models import GenerateSummaryResponse, SummaryResponse
from src.ai_summary.service import FileSummaryService

router = APIRouter(prefix="/ai-summary", tags=["AI Summary"])


@router.post("/files/{file_id}/summary", response_model=GenerateSummaryResponse)
async def generate_summary(
    file_id: int,
    background_tasks: BackgroundTasks,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    # Reuses the same ownership check as every other /files route, so a
    # user can't trigger (or read) a summary for a file they don't own.
    files_service.get_owned_file(db, file_id=file_id, owner_id=owner_id)

    service = FileSummaryService(db)
    existing = service.get_summary(file_id)

    if existing and existing.status == "completed":
        return GenerateSummaryResponse(status="completed", message="Summary already exists")

    if existing and existing.status == "pending":
        return GenerateSummaryResponse(status="pending", message="Summary generation already in progress")

    service.start_generation(file_id)
    background_tasks.add_task(service.process_summary, file_id)

    return GenerateSummaryResponse(status="pending", message="Summary generation started")


@router.get("/files/{file_id}/summary", response_model=SummaryResponse)
def get_summary(
    file_id: int,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    files_service.get_owned_file(db, file_id=file_id, owner_id=owner_id)

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