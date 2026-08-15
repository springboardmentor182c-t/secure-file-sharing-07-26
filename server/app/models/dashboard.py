from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class DashboardUserSummary(Base):
    __tablename__ = "dashboard_user_summary"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    greeting: Mapped[str] = mapped_column(String(80), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(255), nullable=False)
    security_badge: Mapped[str] = mapped_column(String(120), nullable=False)


class DashboardStat(Base):
    __tablename__ = "dashboard_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    trend: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str] = mapped_column(String(180), nullable=False)
    icon: Mapped[str] = mapped_column(String(60), nullable=False)
    tone: Mapped[str] = mapped_column(String(40), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardStorageSummary(Base):
    __tablename__ = "dashboard_storage_summary"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    used_label: Mapped[str] = mapped_column(String(60), nullable=False)
    total_label: Mapped[str] = mapped_column(String(60), nullable=False)
    percentage: Mapped[int] = mapped_column(Integer, nullable=False)


class DashboardStorageBreakdown(Base):
    __tablename__ = "dashboard_storage_breakdown"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    value_label: Mapped[str] = mapped_column(String(60), nullable=False)
    percentage: Mapped[int] = mapped_column(Integer, nullable=False)
    color_class: Mapped[str] = mapped_column(String(80), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardRecentFile(Base):
    __tablename__ = "dashboard_recent_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    file_type: Mapped[str] = mapped_column(String(30), nullable=False)
    owner: Mapped[str] = mapped_column(String(120), nullable=False)
    last_modified: Mapped[str] = mapped_column(String(80), nullable=False)
    size: Mapped[str] = mapped_column(String(40), nullable=False)
    status: Mapped[str] = mapped_column(String(60), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardActivity(Base):
    __tablename__ = "dashboard_recent_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    activity_type: Mapped[str] = mapped_column(String(60), nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    time: Mapped[str] = mapped_column(String(80), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardSecurityStatus(Base):
    __tablename__ = "dashboard_security_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    tone: Mapped[str] = mapped_column(String(40), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardNotification(Base):
    __tablename__ = "dashboard_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(String(220), nullable=False)
    time: Mapped[str] = mapped_column(String(80), nullable=False)
    notification_type: Mapped[str] = mapped_column(String(60), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardUploadTrend(Base):
    __tablename__ = "dashboard_upload_trends"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    day: Mapped[str] = mapped_column(String(20), nullable=False)
    uploads: Mapped[int] = mapped_column(Integer, nullable=False)
    shared: Mapped[int] = mapped_column(Integer, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardFileTypeDistribution(Base):
    __tablename__ = "dashboard_file_type_distribution"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    value: Mapped[int] = mapped_column(Integer, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardSharedFilesSummary(Base):
    __tablename__ = "dashboard_shared_files_summary"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    total: Mapped[int] = mapped_column(Integer, nullable=False)
    active_links: Mapped[int] = mapped_column(Integer, nullable=False)
    expiring_soon: Mapped[int] = mapped_column(Integer, nullable=False)
    restricted_access: Mapped[int] = mapped_column(Integer, nullable=False)


class DashboardSharedFileItem(Base):
    __tablename__ = "dashboard_shared_file_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    value: Mapped[str] = mapped_column(String(60), nullable=False)
    helper: Mapped[str] = mapped_column(String(140), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class DashboardTeamActivity(Base):
    __tablename__ = "dashboard_team_activity"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_key: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    initials: Mapped[str] = mapped_column(String(12), nullable=False)
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    file: Mapped[str] = mapped_column(String(180), nullable=False)
    time: Mapped[str] = mapped_column(String(80), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
