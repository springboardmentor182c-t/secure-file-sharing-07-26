"""Pagination math shared by every module's list endpoint."""
import math

from src.schemas import PaginationMeta


def build_pagination_meta(page: int, page_size: int, total_items: int) -> PaginationMeta:
    total_pages = max(1, math.ceil(total_items / page_size)) if page_size else 1
    return PaginationMeta(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1,
    )
