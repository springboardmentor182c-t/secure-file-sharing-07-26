from sqlalchemy import Column, String, BigInteger, Integer, Boolean, DateTime, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from src.database.core import Base

class File(Base):
    __tablename__ = "files"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    is_deleted = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ShareLink(Base):
    __tablename__ = "share_links"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    download_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    apply_watermark = Column(Boolean, default=False)
    notify_me = Column(Boolean, default=False)
    one_time_view = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SecurityEvent(Base):
    __tablename__ = "security_events"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100))
    severity = Column(String(20))
    description = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class FileAccessHistory(Base):
    __tablename__ = "file_access_history"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    access_type = Column(String(30))
    accessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AnalyticsReport(Base):
    __tablename__ = "analytics_reports"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_type = Column(String(50))
    report_date = Column(Date)
    total_uploads = Column(Integer, default=0)
    total_downloads = Column(Integer, default=0)
    total_shares = Column(Integer, default=0)
    storage_used = Column(BigInteger, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))