from sqlalchemy import Column, Integer, String, Boolean
from src.core import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    ts = Column(String)
    event = Column(String)
    source = Column(String)
    country = Column(String)
    severity = Column(String)
    blocked = Column(Boolean, default=False)
