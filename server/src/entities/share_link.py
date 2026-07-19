from sqlalchemy import Column, Integer, Boolean, TIMESTAMP, ForeignKey

from ..database.core import Base


class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, nullable=False, default=True)
    expires_at = Column(TIMESTAMP, nullable=True)