"""
Pydantic request/response schemas for the Shared Links module.

(Named `models.py` to match this project's existing convention, seen in the
`todos`/`users`/`auth` module folders — these are Pydantic schemas, not the
SQLAlchemy ORM models, which live under `src/entities/`.)
"""
import uuid
from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from src.shared_links.constants import LinkPermission, LinkStatus

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Generic response envelope (used across this module's endpoints; other
# modules are welcome to reuse this same shape for consistency)
# ---------------------------------------------------------------------------

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: Optional[T] = None


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: List[T]
    pagination: PaginationMeta


# ---------------------------------------------------------------------------
# Shared Link schemas
# ---------------------------------------------------------------------------

class SharedLinkCreate(BaseModel):
    """Payload for `POST /shared-links` — matches the frontend's "New Link" modal."""

    file_id: uuid.UUID
    recipient_email: EmailStr
    permission: LinkPermission = LinkPermission.VIEW
    expires_at: Optional[datetime] = None
    password: Optional[str] = Field(default=None, min_length=4, max_length=128)
    allow_download: bool = False

    @field_validator("expires_at")
    @classmethod
    def _expiry_must_be_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None and v.replace(tzinfo=None) <= datetime.utcnow():
            raise ValueError("expires_at must be in the future")
        return v


class SharedLinkUpdate(BaseModel):
    """Payload for `PATCH /shared-links/{id}` — the Edit Link modal."""

    permission: Optional[LinkPermission] = None
    expires_at: Optional[datetime] = None
    password: Optional[str] = Field(default=None, min_length=4, max_length=128)
    remove_password: bool = False
    allow_download: Optional[bool] = None


class SharedLinkStatusUpdate(BaseModel):
    status: LinkStatus


class AccessLinkRequest(BaseModel):
    """Payload for the public `POST /share/{id}/access` and `/download` endpoints."""
    password: Optional[str] = None


class FileSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    file_name: str
    file_type: str


class SharedLinkRead(BaseModel):
    """Shape returned to the frontend — maps 1:1 onto the fields the
    `SharedLinksTable` / `TableRow` React components already render."""

    id: uuid.UUID
    file: FileSummary
    share_url: str
    created_at: datetime
    expires_at: Optional[datetime]
    views: int
    downloads: int
    access: LinkPermission
    status: LinkStatus
    password_protected: bool
    allow_download: bool
    recipient_email: Optional[str]


class SharedLinkPublicView(BaseModel):
    """What an anonymous recipient sees after successfully accessing a link."""

    file_name: str
    file_type: str
    permission: LinkPermission
    allow_download: bool
    expires_at: Optional[datetime]


# ---------------------------------------------------------------------------
# Analytics / notifications schemas
# ---------------------------------------------------------------------------

class StatsSummary(BaseModel):
    active_links: int
    total_views: int
    total_downloads: int
    expiring_soon: int


class MonthlyActivityPoint(BaseModel):
    label: str
    created: int
    access_events: int


class TopFileEntry(BaseModel):
    file_id: uuid.UUID
    file_name: str
    value: int


class RecentActivityEntry(BaseModel):
    shared_link_id: uuid.UUID
    file_name: str
    action: str
    success: bool
    created_at: datetime


class AnalyticsOverview(BaseModel):
    stats: StatsSummary
    monthly_activity: List[MonthlyActivityPoint]
    most_viewed_files: List[TopFileEntry]
    most_downloaded_files: List[TopFileEntry]
    recent_activity: List[RecentActivityEntry]


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# Minimal schemas for the temporary /users and /files dev-testing endpoints
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: EmailStr
    full_name: str


class FileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    owner_id: uuid.UUID
    file_name: str
    file_type: str
    size_bytes: int
