from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from src.database.core import Base

class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    share_token = Column(String(255), unique=True, nullable=False)
    share_type = Column(String(20), CheckConstraint("share_type IN ('public', 'private')"), nullable=False)
    
    password_hash = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    max_downloads = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SharePermission(Base):
    __tablename__ = "share_permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    share_link_id = Column(UUID(as_uuid=True), ForeignKey("share_links.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    can_view = Column(Boolean, default=True)
    can_download = Column(Boolean, default=True)
    can_edit = Column(Boolean, default=False)
    can_share = Column(Boolean, default=False)