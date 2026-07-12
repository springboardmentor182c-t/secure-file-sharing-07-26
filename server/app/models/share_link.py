from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id", ondelete="CASCADE"))
    link_token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    file = relationship("File", backref="share_links")