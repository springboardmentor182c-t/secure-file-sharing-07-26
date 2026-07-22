import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class StatsSummary(BaseModel):
    active_links: int
    total_views: int
    total_downloads: int
    expiring_soon: int
    total_files: int = 0
    total_storage_bytes: int = 0


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
