from sqlalchemy import Column, Integer, String, Boolean
from src.database.core import Base


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    uploaded_at = Column(String, nullable=False)

    # New fields
    category = Column(String, default="Documents")
    tags = Column(String, default="")
    is_encrypted = Column(Boolean, default=True)
    require_password = Column(Boolean, default=False)
    password = Column(String, nullable=True)
    virus_scanned = Column(Boolean, default=False)
    notify_on_access = Column(Boolean, default=False)
    is_safe = Column(Boolean, default=True)