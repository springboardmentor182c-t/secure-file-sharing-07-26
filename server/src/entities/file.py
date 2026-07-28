from sqlalchemy import Column, Integer, String
from src.database.core import Base

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    uploaded_at = Column(String, nullable=False)