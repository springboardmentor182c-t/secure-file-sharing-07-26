"""
Route handler functions for the AI Smart Folder Recommendation module.
Kept separate from `router.py` so the HTTP wiring (paths, tags, response
models) and the request-handling logic can change independently, matching
this project's convention of small, single-responsibility files.
"""
import uuid
from typing import Annotated

from fastapi import Depends, File as FastAPIFile, UploadFile
from sqlalchemy.orm import Session

from src.ai_recommendation import service
from src.ai_recommendation.schemas import RecommendFolderResponse
from src.database.core import get_db
from src.dependencies import get_current_user_id
from src.schemas import ApiResponse


async def recommend_folder(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    upload: UploadFile = FastAPIFile(...),
) -> ApiResponse[RecommendFolderResponse]:
    """
    POST /api/ai/recommend-folder

    Recommends the best destination folder for a file the user is about
    to upload, using Gemini reasoning enhanced and validated by semantic
    (sentence-transformers) embeddings. Does NOT save the file - the
    existing `POST /files` endpoint remains solely responsible for
    persisting uploads. This endpoint never raises on AI/embedding
    failure; it always returns a usable recommendation.
    """
    recommendation = await service.get_folder_recommendation(db, owner_id=owner_id, upload=upload)
    return ApiResponse(message="Recommendation generated", data=recommendation)
