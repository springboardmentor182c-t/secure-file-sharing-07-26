from pydantic import BaseModel


class Summary(BaseModel):
    total_files: int
    storage_used: str
    active_shares: int
    security_events: int


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
    recent_files: list[RecentFile]
    recent_activity: list[RecentActivity]