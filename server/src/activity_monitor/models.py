from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from src.database.core import Base


class Activity(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(120), nullable=False)
    action = Column(String(120), nullable=False)
    file_name = Column(String(255), nullable=False)
    resource = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    status = Column(String(30), nullable=False, default="success")
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)