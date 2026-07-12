from pydantic import BaseModel
from datetime import datetime

class ServiceHealthOut(BaseModel):
    service_name: str
    latency_ms: float
    uptime_pct: float
    status: str
    checked_at: datetime

    class Config:
        from_attributes = True