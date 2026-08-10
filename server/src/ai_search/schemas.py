from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    limit: int = 5


class SearchResult(BaseModel):
    file_id: str
    score: float
    file_name: str
    chunk: int
    text: str


class SearchResponse(BaseModel):
    results: list[SearchResult]