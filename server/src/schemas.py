"""
Generic API response envelope + pagination schemas shared by every module.

This used to be defined only inside `src/shared_links/models.py`. It's
moved here so the Files module (and any future module) can reuse the exact
same response shape instead of redefining it — `shared_links/models.py`
now just re-exports these for backward compatibility.
"""
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


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
