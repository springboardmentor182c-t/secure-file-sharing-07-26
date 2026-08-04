from sqlalchemy import text

from src.database.core import SessionLocal
from .models import (
    DashboardResponse,
    Summary,
    WeeklyActivity,
    StorageType,
    RecentFile,
    RecentActivity,
)


def get_dashboard_data():
    db = SessionLocal()

    try:
        # ---------------- Summary ----------------
        stats = db.execute(
            text("""
                SELECT item_key, value
                FROM dashboard_stats
                ORDER BY display_order
            """)
        ).mappings().all()

        stats_dict = {row["item_key"]: row["value"] for row in stats}

        storage = db.execute(
            text("""
                SELECT used_label, total_label
                FROM dashboard_storage_summary
                LIMIT 1
            """)
        ).mappings().first()

        summary = Summary(
            total_files=int(str(stats_dict.get("total-files", "0")).replace(",", "")),
            new_files_this_week=0,          # Not available in DB
            storage_used=storage["used_label"],
            storage_limit=storage["total_label"],
            active_shares=int(str(stats_dict.get("active-shares", "0")).replace(",", "")),
            new_shares_today=0,             # Not available in DB
            security_events=0,              # Not available in DB
            critical_events=0,              # Not available in DB
        )

        # ---------------- Weekly Activity ----------------
        trends = db.execute(
            text("""
                SELECT day, uploads, shared
                FROM dashboard_upload_trends
                ORDER BY display_order
            """)
        ).mappings().all()

        weekly_activity = WeeklyActivity(
            days=[r["day"] for r in trends],
            uploads=[r["uploads"] for r in trends],
            downloads=[r["shared"] for r in trends],   # Using shared values
        )

        # ---------------- Storage by Type ----------------
        storage_types = db.execute(
            text("""
                SELECT name, value
                FROM dashboard_file_type_distribution
                ORDER BY display_order
            """)
        ).mappings().all()

        storage_by_type = [
            StorageType(
                name=row["name"],
                value=row["value"],
            )
            for row in storage_types
        ]

        # ---------------- Recent Files ----------------
        files = db.execute(
            text("""
                SELECT
                    id,
                    name,
                    size,
                    last_modified
                FROM dashboard_recent_files
                ORDER BY display_order
            """)
        ).mappings().all()

        recent_files = [
            RecentFile(
                id=row["id"],
                name=row["name"],
                size=row["size"],
                uploaded_at=row["last_modified"],
            )
            for row in files
        ]

        # ---------------- Recent Activity ----------------
        activity = db.execute(
            text("""
                SELECT
                    id,
                    title,
                    activity_type,
                    time
                FROM dashboard_recent_activity
                ORDER BY display_order
            """)
        ).mappings().all()

        recent_activity = [
            RecentActivity(
                id=row["id"],
                username="System",
                action=row["title"],
                time=row["time"],
                status=row["activity_type"],
            )
            for row in activity
        ]

        return DashboardResponse(
            summary=summary,
            weekly_activity=weekly_activity,
            storage_by_type=storage_by_type,
            recent_files=recent_files,
            recent_activity=recent_activity,
        )

    finally:
        db.close()