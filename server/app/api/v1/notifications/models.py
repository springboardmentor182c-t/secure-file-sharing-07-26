from sqlalchemy import Column, Integer, String, Text
from src.database.core import Base


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    time = Column(String(50))
    type = Column(String(50))
    icon = Column(String(20))
    color = Column(String(20))