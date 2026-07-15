from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.core import Base

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    size = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(String)
    checksum = Column(String)
    security_status = Column(String)  # 'clean', 'scanning', 'flagged'
    file_type = Column(String)        # 'pdf', 'zip', 'spreadsheet', 'image', 'doc'

    owner = relationship("User")

class FileShare(Base):
    __tablename__ = "file_shares"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    shared_with_user_id = Column(Integer, ForeignKey("users.id"))
    permission = Column(String)       # 'viewer', 'editor'
    shared_at = Column(String)

    file = relationship("File")
    shared_with = relationship("User")
