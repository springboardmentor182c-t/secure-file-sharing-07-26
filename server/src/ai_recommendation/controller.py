"""
AI Smart Folder Recommendation endpoint.

    POST /api/ai/recommend-folder

Takes the same kind of multipart upload the existing `POST /files` endpoint
takes (the file hasn't been uploaded/saved yet), and returns a suggested
existing folder. This is a read-only, additive endpoint - it never creates,
moves, or deletes anything; the actual save still goes through the
existing `POST /files` endpoint untouched.
"""
import logging
import uuid
from typing import Annotated, Optional

from fastapi import Depends, File as FastAPIFile, Form, UploadFile
from sqlalchemy.orm import Session

from src.ai_recommendation.config import AI_RECOMMENDATION_ENABLED
from src.ai_recommendation.router import router
from src.ai_recommendation.schemas import RecommendationData
from src.ai_recommendation.service import recommend_folder
from src.database.core import get_db
from src.dependencies import get_current_user_id
from src.schemas import ApiResponse

logger = logging.getLogger("app.ai_recommendation")


@router.post(
    "/recommend-folder",
    response_model=ApiResponse[RecommendationData],
    summary="Suggest the best existing folder for a not-yet-uploaded file",
)
async def recommend_folder_endpoint(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    upload: UploadFile = FastAPIFile(...),
    current_folder_id: Optional[uuid.UUID] = Form(default=None),
):
    if not AI_RECOMMENDATION_ENABLED:
        return ApiResponse(
            message="AI recommendation is disabled",
            data=RecommendationData(
                confidence=0.0,
                reason="AI recommendation is currently unavailable. Please select a folder manually.",
                source="fallback",
            ),
        )

    contents = await upload.read()
    try:
        result = recommend_folder(
            db, owner_id=owner_id, filename=upload.filename or "upload",
            mime_type=upload.content_type or "application/octet-stream",
            contents=contents, current_folder_id=current_folder_id,
        )
    except Exception:
        # Absolute last resort - the endpoint must never 500 the frontend
        # out of the upload flow. Details are logged, not surfaced.
        logger.exception("AI recommendation crashed unexpectedly for user=%s", owner_id)
        result = RecommendationData(
            confidence=0.0,
            reason="AI recommendation is currently unavailable. Please select a folder manually.",
            source="fallback",
        )

    return ApiResponse(message="Recommendation generated", data=result)
