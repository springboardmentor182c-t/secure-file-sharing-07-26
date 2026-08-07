"""
APIRouter for the AI Smart Folder Recommendation module.

Route summary
-------------
POST /api/ai/recommend-folder   multipart upload in, recommendation out
                                 (does not save the file)

Registered in `src/api.py` alongside every other module's router - see the
comment block there for the team convention this follows.
"""
from fastapi import APIRouter

from src.ai_recommendation.controller import recommend_folder
from src.ai_recommendation.schemas import RecommendFolderResponse
from src.schemas import ApiResponse

router = APIRouter(prefix="/api/ai", tags=["AI Recommendation"])

router.add_api_route(
    "/recommend-folder",
    recommend_folder,
    methods=["POST"],
    response_model=ApiResponse[RecommendFolderResponse],
    status_code=200,
    summary="Recommend the best destination folder for a file about to be uploaded",
)
