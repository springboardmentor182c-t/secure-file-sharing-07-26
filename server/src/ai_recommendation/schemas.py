"""Pydantic request/response models for the AI recommendation endpoint."""
import uuid
from typing import Literal, Optional

from pydantic import BaseModel, Field

RecommendationSource = Literal["grok", "embedding", "fallback"]


class FolderOption(BaseModel):
    """One of the user's existing folders, as sent back for transparency."""

    id: uuid.UUID
    name: str
    file_count: int = 0


class RecommendationData(BaseModel):
    recommended_folder_id: Optional[uuid.UUID] = None
    recommended_folder_name: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    source: RecommendationSource
    has_folders: bool = True


class RawGrokRecommendation(BaseModel):
    """Shape we ask Grok to return. Never trusted until validated against
    the user's real folder set in service.py."""

    recommended_folder_id: str
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str = ""
