from sqlalchemy import Column, Integer, String
from src.database.core import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    report = Column(String, nullable=False)
    period = Column(String, nullable=False)
    generated = Column(String, nullable=False)
    events = Column(Integer, nullable=False)
    findings = Column(String, nullable=False)