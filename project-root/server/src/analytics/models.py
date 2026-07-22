from pydantic import BaseModel
from typing import List


class StatCard(BaseModel):
    label: str
    value: str
    trend: str


class BarChartData(BaseModel):
    labels: List[str]
    uploads: List[int]
    downloads: List[int]
    shares: List[int]


class SecurityData(BaseModel):
    labels: List[str]
    logins: List[float]
    failures: List[float]
    threats: List[float]


class TopUser(BaseModel):
    name: str
    actions: int
    pct: float


class SystemHealth(BaseModel):
    uptime: float
    avg_response_ms: float
    error_rate: float
    throughput_gb_hr: float
    status: str
    last_checked: str


class AnalyticsSummaryResponse(BaseModel):
    stats: List[StatCard]
    bar: BarChartData
    security: SecurityData
    top_users: List[TopUser]
    health: SystemHealth
