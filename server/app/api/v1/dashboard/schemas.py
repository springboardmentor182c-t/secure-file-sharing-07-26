from pydantic import BaseModel


class DashboardUser(BaseModel):
    name: str
    greeting: str
    subtitle: str
    securityBadge: str


class DashboardStat(BaseModel):
    id: str
    label: str
    value: str
    trend: str
    description: str
    icon: str
    tone: str


class StorageBreakdownItem(BaseModel):
    id: str
    label: str
    valueLabel: str
    percentage: int
    colorClass: str


class DashboardStorage(BaseModel):
    usedLabel: str
    totalLabel: str
    percentage: int
    breakdown: list[StorageBreakdownItem]


class RecentFile(BaseModel):
    id: str
    name: str
    type: str
    owner: str
    lastModified: str
    size: str
    status: str


class RecentActivity(BaseModel):
    id: str
    type: str
    title: str
    time: str


class SecurityStatus(BaseModel):
    id: str
    label: str
    value: str
    tone: str


class NotificationPreview(BaseModel):
    id: str
    title: str
    description: str
    time: str
    type: str


class UploadTrendPoint(BaseModel):
    day: str
    uploads: int
    shared: int


class FileTypePoint(BaseModel):
    name: str
    value: int


class SharedFileItem(BaseModel):
    id: str
    label: str
    value: str
    helper: str


class SharedFilesSummary(BaseModel):
    total: int
    activeLinks: int
    expiringSoon: int
    restrictedAccess: int
    items: list[SharedFileItem]


class TeamActivity(BaseModel):
    id: str
    name: str
    initials: str
    action: str
    file: str
    time: str


class DashboardSummaryResponse(BaseModel):
    user: DashboardUser
    stats: list[DashboardStat]
    sharedFiles: SharedFilesSummary


class DashboardChartsResponse(BaseModel):
    uploadTrend: list[UploadTrendPoint]
    fileTypes: list[FileTypePoint]
