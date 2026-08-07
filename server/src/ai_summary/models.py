"""
Pydantic schemas for the AI File Summary feature.
These define request/response shapes for the controller endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SummaryStatus:
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    NOT_GENERATED = "not_generated"


class GenerateSummaryResponse(BaseModel):
    status: str
    message: Optional[str] = None


class SummaryResponse(BaseModel):
    status: str
    summary: Optional[str] = None
    model_used: Optional[str] = None
    generated_at: Optional[datetime] = None

    class Config:
        from_attributes = True