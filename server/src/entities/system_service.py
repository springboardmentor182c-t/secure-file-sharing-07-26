from sqlalchemy import Column, Integer, String, Numeric

from ..database.core import Base


class SystemService(Base):
    __tablename__ = "system_services"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    latency_ms = Column(Numeric(10, 2), nullable=False, default=0)
    uptime_percent = Column(Numeric(5, 2), nullable=False, default=99.9)
    status = Column(String(20), nullable=False, default="Operational")