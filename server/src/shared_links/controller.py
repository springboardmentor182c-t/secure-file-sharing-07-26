"""
Shared Links API routes.

Route summary
-------------
POST   /shared-links                 create a link
GET    /shared-links                 search/filter/sort/paginate
GET    /shared-links/{id}            get one (owner)
PATCH  /shared-links/{id}            edit permission/expiry/password
PATCH  /shared-links/{id}/status     set status directly
POST   /shared-links/{id}/toggle     enable/disable toggle
POST   /shared-links/{id}/revoke     revoke
DELETE /shared-links/{id}            delete

GET    /share/{id}                   (see public_router) public link info is
                                      folded into POST /access below
POST   /share/{id}/access            public: validate + register a view
POST   /share/{id}/download          public: register a download

GET    /analytics/overview           stats + chart + top files + recent activity
GET    /notifications                list the caller's notifications
POST   /notifications/{id}/read      mark one as read

POST   /users, GET /users            temporary only (until Auth module lands)
"""
import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.exceptions import NotFoundError
from src.shared_links import dev_data_service, notification_service, service
from src.shared_links.constants import DEFAULT_PAGE_SIZE, LinkPermission, LinkStatus, SortField
from src.shared_links.dependencies import get_current_user_id
from src.shared_links.models import (
    AccessLinkRequest,
    ApiResponse,
    FileSummary,
    NotificationRead,
    PaginatedResponse,
    SharedLinkCreate,
    SharedLinkPublicView,
    SharedLinkRead,
    SharedLinkStatusUpdate,
    SharedLinkUpdate,
    UserCreate,
    UserRead,
)
from src.shared_links.utils import build_pagination_meta, build_share_url

router = APIRouter(prefix="/shared-links", tags=["Shared Links"])
public_router = APIRouter(prefix="/share", tags=["Public Link Access"])
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])
dev_router = APIRouter(tags=["Dev/Testing Only"])

# Compatibility aliases used by the main API aggregator.
api_shared_router = router
api_users_router = dev_router


def _serialize(link) -> SharedLinkRead:
    return SharedLinkRead(
        id=link.id,
        file=FileSummary.model_validate(link.file),
        share_url=build_share_url(link.id),
        created_at=link.created_at,
        expires_at=link.expires_at,
        views=link.views,
        downloads=link.downloads,
        access=link.permission,
        status=link.status,
        password_protected=link.password_protected,
        allow_download=link.allow_download,
        recipient_email=link.recipient_email,
    )


# ---------------------------------------------------------------------------
# Owner-facing management
# ---------------------------------------------------------------------------


@router.post("", response_model=ApiResponse[SharedLinkRead], status_code=201, summary="Create a new shared link")
def create_shared_link(
    payload: SharedLinkCreate,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    link = service.create_link(db, owner_id=owner_id, data=payload)
    return ApiResponse(message="Shared link created", data=_serialize(link))


@router.get("", response_model=PaginatedResponse[SharedLinkRead], summary="Search/filter/sort/paginate")
def list_shared_links(
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    search: Optional[str] = Query(default=None, description="Match file name or recipient email"),
    status_filter: Optional[LinkStatus] = Query(default=None, alias="status"),
    permission: Optional[LinkPermission] = Query(default=None),
    expiring_within_days: Optional[int] = Query(default=None, ge=0),
    sort_by: SortField = Query(default=SortField.NEWEST, alias="sort"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=100),
):
    links, total = service.search_links(
        db, owner_id=owner_id, search=search, status=status_filter, permission=permission,
        expiring_within_days=expiring_within_days, sort_by=sort_by, page=page, page_size=page_size,
    )
    return PaginatedResponse(data=[_serialize(l) for l in links], pagination=build_pagination_meta(page, page_size, total))


@router.get("/{link_id}", response_model=ApiResponse[SharedLinkRead], summary="Get a single shared link")
def get_shared_link(
    link_id: uuid.UUID,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    link = service.get_owned_link(db, link_id=link_id, owner_id=owner_id)
    return ApiResponse(data=_serialize(link))


@router.patch("/{link_id}", response_model=ApiResponse[SharedLinkRead], summary="Edit a shared link")
def update_shared_link(
    link_id: uuid.UUID,
    payload: SharedLinkUpdate,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    link = service.update_link(db, link_id=link_id, owner_id=owner_id, data=payload)
    return ApiResponse(message="Shared link updated", data=_serialize(link))


@router.patch("/{link_id}/status", response_model=ApiResponse[SharedLinkRead], summary="Directly set a link's status")
def set_shared_link_status(
    link_id: uuid.UUID,
    payload: SharedLinkStatusUpdate,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    link = service.set_status(db, link_id=link_id, owner_id=owner_id, status=payload.status)
    return ApiResponse(message="Status updated", data=_serialize(link))


@router.post("/{link_id}/toggle", response_model=ApiResponse[SharedLinkRead], summary="Toggle active/disabled")
def toggle_shared_link(
    link_id: uuid.UUID,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    link = service.toggle_enabled(db, link_id=link_id, owner_id=owner_id)
    return ApiResponse(message="Status toggled", data=_serialize(link))


@router.post("/{link_id}/revoke", response_model=ApiResponse[SharedLinkRead], summary="Revoke a shared link")
def revoke_shared_link(
    link_id: uuid.UUID,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    link = service.revoke_link(db, link_id=link_id, owner_id=owner_id)
    return ApiResponse(message="Link revoked", data=_serialize(link))


@router.delete("/{link_id}", response_model=ApiResponse[None], summary="Permanently delete a shared link")
def delete_shared_link(
    link_id: uuid.UUID,
    owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
):
    service.delete_link(db, link_id=link_id, owner_id=owner_id)
    return ApiResponse(message="Link deleted", data=None)


# ---------------------------------------------------------------------------
# Public access (recipient flow — no auth)
# ---------------------------------------------------------------------------


@public_router.post("/{link_id}/access", response_model=ApiResponse[SharedLinkPublicView], summary="Validate + register a view")
def access_shared_link(link_id: uuid.UUID, payload: AccessLinkRequest, request: Request, db: Annotated[Session, Depends(get_db)]):
    link = service.access_link(
        db, link_id=link_id, password=payload.password,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return ApiResponse(data=SharedLinkPublicView(
        file_name=link.file.file_name, file_type=link.file.file_type,
        permission=link.permission, allow_download=link.allow_download, expires_at=link.expires_at,
    ))


@public_router.post("/{link_id}/download", response_model=ApiResponse[dict], summary="Register a download")
def download_shared_link(link_id: uuid.UUID, payload: AccessLinkRequest, request: Request, db: Annotated[Session, Depends(get_db)]):
    link = service.download_link(
        db, link_id=link_id, password=payload.password,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return ApiResponse(message="Download registered", data={"downloads": link.downloads})


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------


@analytics_router.get("/overview", response_model=ApiResponse[dict], summary="Full analytics overview")
def get_overview(owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    overview = service.get_analytics_overview(db, owner_id)
    return ApiResponse(data=overview.model_dump())


@analytics_router.get("/stats", response_model=ApiResponse[dict], summary="Just the four summary stat cards")
def get_stats(owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    stats = service.get_stats(db, owner_id)
    return ApiResponse(data=stats.model_dump())


@analytics_router.get("/monthly-activity", response_model=ApiResponse[list], summary="Links created vs access events per month")
def get_monthly_activity(owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    data = service.get_monthly_activity(db, owner_id)
    return ApiResponse(data=[d.model_dump() for d in data])


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------


@notifications_router.get("", response_model=ApiResponse[list[NotificationRead]], summary="List the caller's notifications")
def list_notifications(owner_id: Annotated[uuid.UUID, Depends(get_current_user_id)], db: Annotated[Session, Depends(get_db)]):
    notifications = notification_service.list_for_user(db, owner_id)
    return ApiResponse(data=[NotificationRead.model_validate(n) for n in notifications])


@notifications_router.post("/{notification_id}/read", response_model=ApiResponse[NotificationRead], summary="Mark as read")
def mark_notification_read(notification_id: uuid.UUID, db: Annotated[Session, Depends(get_db)]):
    notification = notification_service.mark_read(db, notification_id)
    if notification is None:
        raise NotFoundError(f"Notification {notification_id} not found")
    return ApiResponse(message="Marked as read", data=NotificationRead.model_validate(notification))


# ---------------------------------------------------------------------------
# Temporary /users endpoints (delete once the real Auth module lands)
# ---------------------------------------------------------------------------


@dev_router.post("/users", response_model=ApiResponse[UserRead], status_code=201, summary="[temporary] create a user")
def create_user(payload: UserCreate, db: Annotated[Session, Depends(get_db)]):
    user = dev_data_service.create_user(db, payload)
    return ApiResponse(message="User created", data=UserRead.model_validate(user))


@dev_router.get("/users", response_model=ApiResponse[list[UserRead]], summary="[temporary] list users")
def list_users(db: Annotated[Session, Depends(get_db)]):
    users = dev_data_service.list_users(db)
    return ApiResponse(data=[UserRead.model_validate(u) for u in users])
