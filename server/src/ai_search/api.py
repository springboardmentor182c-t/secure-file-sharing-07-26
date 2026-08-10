from typing import Annotated
import uuid

from fastapi import APIRouter, Depends

from src.shared_links.dependencies import get_current_user_id

from .schemas import (
    SearchRequest,
    SearchResponse,
    SearchResult,
)
from .search import semantic_search


router = APIRouter(
    prefix="/ai-search",
    tags=["AI Search"],
)


@router.post(
    "/search",
    response_model=SearchResponse,
)
def search(
    request: SearchRequest,
    user_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
):

    results = semantic_search(
        query=request.query,
        user_id=str(user_id),
        limit=request.limit,
    )

    response = []

    for item in results:

        response.append(
            SearchResult(
                file_id=item.payload["file_id"],
                score=item.score,
                file_name=item.payload["file_name"],
                chunk=item.payload["chunk_number"],
                text=item.payload["text"],
            )
        )

    return SearchResponse(results=response)