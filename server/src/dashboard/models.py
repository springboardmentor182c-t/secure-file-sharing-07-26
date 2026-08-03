from pydantic import BaseModel


class Summary(BaseModel):
    total_files: int
    new_files_this_week: int

    storage_used: str
    storage_limit: str

    active_shares: int
    new_shares_today: int

    security_events: int
    critical_events: int


class WeeklyActivity(BaseModel):
    days: list[str]
    uploads: list[int]
    downloads: list[int]


class StorageType(BaseModel):
    name: str
    value: int


class RecentFile(BaseModel):
    id: int
    name: str
    size: str
    uploaded_at: str


class RecentActivity(BaseModel):
    id: int
    username: str
    action: str
    time: str
    status: str


class DashboardResponse(BaseModel):
    summary: Summary
    weekly_activity: WeeklyActivity
    storage_by_type: list[StorageType]
    recent_files: list[RecentFile]
    recent_activity: list[RecentActivity]