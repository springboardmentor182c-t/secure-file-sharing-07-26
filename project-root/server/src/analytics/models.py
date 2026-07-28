from pydantic import BaseModel
from typing import List


class StatCard(BaseModel):
    label: str
    value: str
    sub: str
    trend: str          # e.g. "+12%"
    trend_up: bool


class ActivityPoint(BaseModel):
    label: str          # e.g. "Mon", "Jul 20"
    uploads: int
    downloads: int
    encryptions: int


class FileTypeStat(BaseModel):
    mime_group: str     # e.g. "Documents", "Images"
    count: int
    pct: float          # 0-100


class RecentAction(BaseModel):
    action: str
    resource: str
    level: str          # info | warn | error | success
    time_ago: str       # e.g. "2 h ago"


class StorageBreakdown(BaseModel):
    label: str
    bytes_used: int
    pct: float          # 0-100
    color: str          # hex


class AnalyticsSummary(BaseModel):
    stats: List[StatCard]
    activity: List[ActivityPoint]
    file_types: List[FileTypeStat]
    recent_actions: List[RecentAction]
    storage: StorageBreakdown
    storage_quota_gb: float
    storage_used_gb: float
