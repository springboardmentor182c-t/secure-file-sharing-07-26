from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from src.database.core import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)        # share | security | upload | access | download
    category = Column(String, nullable=False)    # shares | security | uploads | activity
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    icon = Column(String, default="🔔")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
