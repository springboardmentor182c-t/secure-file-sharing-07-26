from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship

from ..database.core import Base


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_name = Column(String(255), nullable=False)
    size_mb = Column(Numeric(10, 2), nullable=False, default=0)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    owner = relationship("User", back_populates="files")
