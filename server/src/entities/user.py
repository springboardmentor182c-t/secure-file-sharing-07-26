from sqlalchemy import Column, Integer, String, Numeric, Boolean, TIMESTAMP, func
from sqlalchemy.orm import relationship

from ..database.core import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    role = Column(String(20), nullable=False, default="Viewer")
    mfa_enabled = Column(Boolean, nullable=False, default=False)
    status = Column(String(20), nullable=False, default="Active")
    storage_used_gb = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

    files = relationship("File", back_populates="owner")