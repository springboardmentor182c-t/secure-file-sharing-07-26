from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class ServiceHealth(Base):
    __tablename__ = "service_health"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String, nullable=False)
    latency_ms = Column(Float, default=0)
    uptime_pct = Column(Float, default=100.0)
    status = Column(String, default="Operational")  # Operational, Degraded, Down
    checked_at = Column(DateTime, server_default=func.now())