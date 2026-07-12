from sqlalchemy import Column, Integer, String, BigInteger, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    file_name = Column(String, nullable=False)
    size_mb = Column(BigInteger, default=0)
    uploaded_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", backref="files")