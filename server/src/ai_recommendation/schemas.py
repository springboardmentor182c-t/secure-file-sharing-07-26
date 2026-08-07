"""Pydantic schemas for the AI Smart Folder Recommendation module."""
import uuid
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

# "ai"          - Gemini's pick agreed with (was inside) the embedding Top 3.
# "ai_adjusted" - Gemini picked an existing folder outside the Top 3; the
#                 embedding engine's ranking corrected the final pick.
# "embedding"   - Gemini was unavailable/invalid; the embedding engine's
#                 own Top-1 candidate was used directly.
# "fallback"    - Embeddings were also unavailable (dependency missing or
#                 no folders yet); the deterministic rule-based recommender
#                 (extension / folder-name keyword / history) was used.
RecommendationSource = Literal["ai", "ai_adjusted", "embedding", "fallback"]


class GeminiRecommendationPayload(BaseModel):
    """The exact strict-JSON shape we require Gemini to return. Used to
    validate/parse the model's raw text output; never returned directly to
    the client (see `RecommendFolderResponse` for that)."""

    recommended_folder: str = Field(min_length=1, max_length=255)
    confidence: float = Field(ge=0, le=100)
    reason: str = Field(min_length=1, max_length=1000)

    @field_validator("recommended_folder", "reason")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()

    @field_validator("confidence")
    @classmethod
    def _clamp(cls, v: float) -> float:
        return max(0.0, min(100.0, float(v)))


class CandidateFolder(BaseModel):
    """One ranked folder candidate from the embedding engine."""

    folder_name: str
    folder_id: Optional[uuid.UUID] = None
    similarity_score: float = Field(ge=0, le=1)


class RecommendFolderResponse(BaseModel):
    """Response body for `POST /api/ai/recommend-folder`."""

    recommended_folder: str
    folder_id: Optional[uuid.UUID] = None
    is_new_folder_suggestion: bool = False
    confidence: float = Field(ge=0, le=100)
    reason: str
    source: RecommendationSource

    similarity_score: Optional[float] = Field(default=None, ge=0, le=1)
    alternative_folders: List[CandidateFolder] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    available_folders: List[str] = Field(default_factory=list)
    embedding_engine_available: bool = True


class FolderSummary(BaseModel):
    """Internal-use only: one folder as fed into the prompt/embeddings/fallback."""

    id: uuid.UUID
    name: str


class UploadHistoryEntry(BaseModel):
    """Internal-use only: one prior upload as fed into the prompt/fallback."""

    filename: str
    extension: str
    folder_name: Optional[str] = None
    category: Optional[str] = None
