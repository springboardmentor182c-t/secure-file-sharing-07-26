import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from src.database.core import Base

class ShareLink(Base):
    """
    SQLAlchemy model representing the 'share_links' table in the database.
    Stores core metadata and security configurations for each generated sharing link.
    """
    __tablename__ = "share_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), nullable=False) # Foreign key constraint will be added when files table is ready
    created_by = Column(UUID(as_uuid=True), nullable=False) # Foreign key constraint will be added when users table is ready
    
    share_token = Column(String(255), unique=True, nullable=False)
    share_type = Column(String(20), nullable=False)
    password_hash = Column(String, nullable=True)
    
    expires_at = Column(DateTime, nullable=True)
    max_downloads = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Advanced Security Features
    apply_watermark = Column(Boolean, default=False)
    notify_me = Column(Boolean, default=False)
    one_time_view = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())

class SharePermission(Base):
    """
    SQLAlchemy model representing the 'share_permissions' table.
    Manages Access Control List (ACL) configurations for specific users or emails.
    """
    __tablename__ = "share_permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    share_link_id = Column(UUID(as_uuid=True), ForeignKey("share_links.id", ondelete="CASCADE"), nullable=False)
    user_email = Column(String, nullable=False)
    access_level = Column(String, default="View Only")