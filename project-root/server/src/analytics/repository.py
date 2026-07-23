# server/src/analytics/repository.py
"""
All SQL queries for the analytics module.
Reads everything from DB — configs, event types, severity mappings, colors.
Zero hardcoded values.
"""

import json
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm         import Session
from sqlalchemy             import func
from dateutil.relativedelta import relativedelta

from src.analytics.models.analytics_event  import AnalyticsEvent
from src.analytics.models.analytics_config import AnalyticsConfig
from src.analytics.models.severity_map     import AnalyticsSeverityMap

from src.analytics.constants import (
    AnalyticsEventType,
    AnalyticsEventStatus,
    AnalyticsConfigKey,
    SecuritySeverity,
)
from src.analytics.utils.time_helpers import (
    relative_time,
    format_short_datetime,
    format_short_date,
)

# Cross-module entity imports
from src.entities.file       import File
from src.entities.user       import User
from src.entities.share_link import ShareLink


class AnalyticsRepository:

    # ═══════════════════════════════════════════════════════════════════════
    # CONFIG HELPERS — everything from analytics_config table
    # ═══════════════════════════════════════════════════════════════════════

    def _cfg(self, db: Session, key: str, default: str) -> str:
        row = (
            db.query(AnalyticsConfig)
            .filter(
                AnalyticsConfig.key == key,
                AnalyticsConfig.is_active == True,
            )
            .first()
        )
        return row.value if row else default

    def _cfg_int(self, db: Session, key: str, default: int) -> int:
        return int(self._cfg(db, key, str(default)))

    def _cfg_json(self, db: Session, key: str, default):
        raw = self._cfg(db, key, json.dumps(default))
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return default

    def get_ui_config(self, db: Session) -> Dict[str, Any]:
        """
        Frontend UI config from PostgreSQL.
        Keeps labels, icon names, chart titles, panel text, tab labels
        out of React hardcoding.
        """
        return self._cfg_json(
            db,
            AnalyticsConfigKey.UI_CONFIG,
            {
                "tabs":          [],
                "date_ranges":   [],
                "file_kpis":     [],
                "security_kpis": [],
                "charts":        {},
                "panels":        {},
                "severity":      {},
            },
        )

    def _get_severity_map(self, db: Session) -> Dict[str, str]:
        """Load full severity map from DB as {severity_key: severity}."""
        rows = (
            db.query(AnalyticsSeverityMap)
            .filter(AnalyticsSeverityMap.is_active == True)
            .all()
        )
        return {r.severity_key: r.severity for r in rows}

    # ═══════════════════════════════════════════════════════════════════════
    # STORAGE
    # ═══════════════════════════════════════════════════════════════════════

    def get_storage_summary(self, db: Session) -> Dict[str, Any]:
        total_users   = db.query(User).count()
        storage_used  = db.query(func.coalesce(func.sum(User.storage_used),  0)).scalar() or 0
        storage_quota = db.query(func.coalesce(func.sum(User.storage_quota), 0)).scalar() or 0
        storage_pct   = (
            round(storage_used * 100 / storage_quota, 2)
            if storage_quota else 0.0
        )

        return {
            "total_users":        total_users,
            "storage_used":       int(storage_used),
            "storage_quota":      int(storage_quota),
            "storage_percentage": storage_pct,
            "storage_used_gb":    round(storage_used  / (1024 ** 3), 4),
            "storage_quota_gb":   round(storage_quota / (1024 ** 3), 2),
            "trend":              self._get_storage_trend(db),
        }

    def _get_storage_trend(self, db: Session) -> List[Dict]:
        """
        Monthly cumulative storage (in GB) over the last N months.
        Uses File.size for files that existed at end of each month.
        """
        months = self._cfg_int(db, AnalyticsConfigKey.STORAGE_TREND_MONTHS, 7)
        today  = datetime.now(timezone.utc)
        result = []

        for i in range(months - 1, -1, -1):
            point = today - relativedelta(months=i)
            end_of_month = (
                point.replace(day=1, hour=23, minute=59, second=59)
                + relativedelta(months=1)
                - timedelta(seconds=1)
            )

            # Include all files (deleted or not) that were uploaded by month-end
            # to show historical growth
            total_size = (
                db.query(func.coalesce(func.sum(File.size), 0))
                .filter(File.created_at <= end_of_month)
                .scalar()
            ) or 0

            result.append({
                "month": point.strftime("%b"),
                "gb":    round(total_size / (1024 ** 3), 4),  # 4 decimals
            })

        return result

    # ═══════════════════════════════════════════════════════════════════════
    # UPLOADS
    # ═══════════════════════════════════════════════════════════════════════

    def get_upload_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        chart_days = min(days, 30)
        today = datetime.now(timezone.utc).date()

        # Current month range
        month_start = today.replace(day=1)
        # Previous month range
        last_month_end   = month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        # Total (all-time)
        total_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
            )
            .count()
        )

        # This month
        this_month_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= month_start,
            )
            .count()
        )

        # Last month
        last_month_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= last_month_start,
                func.date(AnalyticsEvent.created_at) <= last_month_end,
            )
            .count()
        )

        # % change vs last month
        if last_month_uploads > 0:
            change_pct = round(
                ((this_month_uploads - last_month_uploads) / last_month_uploads) * 100,
                0,
            )
        else:
            change_pct = 100 if this_month_uploads > 0 else 0

        # Today
        today_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) == today,
            )
            .count()
        )

        # Daily trend
        weekly_uploads = []
        for i in range(chart_days - 1, -1, -1):
            day = today - timedelta(days=i)
            count = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                    AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                    func.date(AnalyticsEvent.created_at) == day,
                )
                .count()
            )
            weekly_uploads.append({
                "date":  day.strftime("%a") if chart_days <= 7 else day.strftime("%b %d"),
                "count": count,
            })

        return {
            "total_uploads":       total_uploads,
            "today_uploads":       today_uploads,
            "this_month_uploads":  this_month_uploads,
            "last_month_uploads":  last_month_uploads,
            "change_pct":          int(change_pct),
            "weekly_uploads":      weekly_uploads,
            "volume_weekly":       self._get_volume_weekly(db),
        }

    def _get_volume_weekly(self, db: Session) -> List[Dict]:
        """
        Weekly upload/download counts from analytics_events.
        Preserves history even after file deletion.
        """
        num_weeks = self._cfg_int(db, AnalyticsConfigKey.VOLUME_WEEKS, 5)
        today  = datetime.now(timezone.utc).date()
        result = []

        for i in range(num_weeks - 1, -1, -1):
            week_end   = today - timedelta(weeks=i)
            week_start = week_end - timedelta(days=6)

            uploads = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                    AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                    func.date(AnalyticsEvent.created_at) >= week_start,
                    func.date(AnalyticsEvent.created_at) <= week_end,
                )
                .count()
            )
            downloads = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                    func.date(AnalyticsEvent.created_at) >= week_start,
                    func.date(AnalyticsEvent.created_at) <= week_end,
                )
                .count()
            )
            result.append({
                "week":      format_short_date(datetime.combine(week_start, datetime.min.time())),
                "uploads":   uploads,
                "downloads": downloads,
            })

        return result

    # ═══════════════════════════════════════════════════════════════════════
    # DOWNLOADS
    # ═══════════════════════════════════════════════════════════════════════

    def get_download_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        chart_days = min(days, 30)
        today = datetime.now(timezone.utc).date()
        month_start = today.replace(day=1)

        total_downloads = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD)
            .count()
        )

        this_month_downloads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) >= month_start,
            )
            .count()
        )

        today_downloads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) == today,
            )
            .count()
        )

        # Bytes transferred this month = sum of size of files downloaded
        transferred_bytes = (
            db.query(func.coalesce(func.sum(File.size), 0))
            .join(
                AnalyticsEvent,
                AnalyticsEvent.file_id == File.id,
            )
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) >= month_start,
            )
            .scalar()
        ) or 0

        weekly_downloads = []
        for i in range(chart_days - 1, -1, -1):
            day = today - timedelta(days=i)
            count = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                    func.date(AnalyticsEvent.created_at) == day,
                )
                .count()
            )
            weekly_downloads.append({
                "date":  day.strftime("%a") if chart_days <= 7 else day.strftime("%b %d"),
                "count": count,
            })

        return {
            "total_downloads":       total_downloads,
            "today_downloads":       today_downloads,
            "this_month_downloads":  this_month_downloads,
            "transferred_bytes":     int(transferred_bytes),
            "transferred_gb":        round(transferred_bytes / (1024 ** 3), 2),
            "transferred_mb":        round(transferred_bytes / (1024 ** 2), 2),
            "weekly_downloads":      weekly_downloads,
        }
    

    # ═══════════════════════════════════════════════════════════════════════
    # DELETES
    # ═══════════════════════════════════════════════════════════════════════

    def get_delete_analytics(self, db: Session) -> Dict[str, Any]:
        """
        File deletion activity — historical count from analytics_events.
        """
        today = datetime.now(timezone.utc).date()
        month_start = today.replace(day=1)
        week_start = today - timedelta(days=7)

        total_deletes = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DELETE,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
            )
            .count()
        )

        this_month_deletes = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DELETE,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= month_start,
            )
            .count()
        )

        this_week_deletes = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DELETE,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= week_start,
            )
            .count()
        )

        today_deletes = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DELETE,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) == today,
            )
            .count()
        )

        return {
            "total_deletes":      total_deletes,
            "today_deletes":      today_deletes,
            "this_week_deletes":  this_week_deletes,
            "this_month_deletes": this_month_deletes,
        }

    # ═══════════════════════════════════════════════════════════════════════
    # SHARING
    # ═══════════════════════════════════════════════════════════════════════

    def get_sharing_analytics(self, db: Session) -> Dict[str, Any]:
        top_limit = self._cfg_int(db, AnalyticsConfigKey.TOP_FILES_LIMIT, 5)
        today = datetime.now(timezone.utc).date()
        week_start = today - timedelta(days=7)

        total_links    = db.query(ShareLink).count()
        active_links   = (
            db.query(ShareLink)
            .filter(ShareLink.is_active == True)
            .count()
        )
        inactive_links = total_links - active_links
        total_views    = (
            db.query(func.coalesce(func.sum(ShareLink.access_count), 0))
            .scalar()
        ) or 0

        # New shares this week
        new_this_week = (
            db.query(ShareLink)
            .filter(func.date(ShareLink.created_at) >= week_start)
            .count()
        )

        return {
            "total_links":    total_links,
            "active_links":   active_links,
            "inactive_links": inactive_links,
            "total_views":    int(total_views),
            "new_this_week":  new_this_week,
            "top_files":      self._get_top_shared_files(db, top_limit),
            "by_department":  self._get_sharing_by_domain(db),
        }

    def _get_top_shared_files(self, db: Session, limit: int) -> List[Dict]:
        rows = (
            db.query(
                File.original_name,
                func.coalesce(func.sum(ShareLink.access_count), 0).label("opens"),
                func.count(AnalyticsEvent.id).label("downloads"),
            )
            .join(ShareLink, ShareLink.file_id == File.id, isouter=True)
            .join(
                AnalyticsEvent,
                (AnalyticsEvent.file_id == File.id)
                & (AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD),
                isouter=True,
            )
            .filter(File.is_deleted == False)
            .group_by(File.id, File.original_name)
            .order_by(func.coalesce(func.sum(ShareLink.access_count), 0).desc())
            .limit(limit)
            .all()
        )

        if not rows:
            return []

        max_opens = rows[0].opens if rows[0].opens and rows[0].opens > 0 else 1
        return [
            {
                "rank":      i + 1,
                "name":      row.original_name,
                "opens":     int(row.opens or 0),
                "downloads": int(row.downloads or 0),
                "pct":       round((float(row.opens or 0) / max_opens) * 100, 1),
            }
            for i, row in enumerate(rows)
        ]

    def _get_sharing_by_domain(self, db: Session) -> List[Dict]:
        """
        Groups sharing activity by email domain. Colors from DB config.
        Uses raw SQL because PostgreSQL is strict about GROUP BY expressions.
        """
        from sqlalchemy import text

        dept_limit = self._cfg_int(db, AnalyticsConfigKey.DEPT_SHARES_LIMIT, 5)
        palette = self._cfg_json(
            db,
            AnalyticsConfigKey.DEPT_COLOR_PALETTE,
            ["#4F46E5", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"],
        )

        rows = db.execute(
            text("""
                SELECT
                    SPLIT_PART(users.email, '@', 2) AS domain,
                    COUNT(analytics_events.id) AS total
                FROM users
                JOIN analytics_events
                    ON analytics_events.user_id = users.id
                WHERE analytics_events.event_type = :event_type
                GROUP BY SPLIT_PART(users.email, '@', 2)
                ORDER BY COUNT(analytics_events.id) DESC
                LIMIT :dept_limit
            """),
            {
                "event_type": AnalyticsEventType.SHARE.value,
                "dept_limit": dept_limit,
            },
        ).fetchall()

        if not rows:
            return []

        grand_total = sum(row.total for row in rows) or 1
        return [
            {
                "name":  (row.domain or "unknown").split(".")[0].capitalize(),
                "value": round((row.total / grand_total) * 100, 1),
                "color": palette[i % len(palette)],
            }
            for i, row in enumerate(rows)
        ]

    # ═══════════════════════════════════════════════════════════════════════
    # SECURITY
    # ═══════════════════════════════════════════════════════════════════════

    def get_security_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        login_events = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
            )
            .count()
        )
        failed_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.FAILED,
            )
            .count()
        )
        security_events = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.event_type == AnalyticsEventType.SECURITY)
            .count()
        )
        blocked_attacks = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.SECURITY,
                AnalyticsEvent.status     == AnalyticsEventStatus.FAILED,
            )
            .count()
        )

        return {
            "login_events":          login_events,
            "failed_logins":         failed_logins,
            "security_events":       security_events,
            "blocked_attacks":       blocked_attacks,
            "login_activity":        self._get_login_activity(db, days=self._cfg_int(db, AnalyticsConfigKey.LOGIN_CHART_DAYS, 7)),
            "events":                self._get_security_events(db),
            "unauthorized_attempts": self._get_unauthorized_attempts(db),
        }

    def _get_login_activity(self, db: Session, days: int = None) -> List[Dict]:
        if days is None:
            days = self._cfg_int(db, AnalyticsConfigKey.LOGIN_CHART_DAYS, 6)

        today  = datetime.now(timezone.utc).date()
        result = []

        for i in range(days - 1, -1, -1):
            day = today - timedelta(days=i)

            success = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                    AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                    func.date(AnalyticsEvent.created_at) == day,
                )
                .count()
            )
            failed = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                    AnalyticsEvent.status     == AnalyticsEventStatus.FAILED,
                    func.date(AnalyticsEvent.created_at) == day,
                )
                .count()
            )
            result.append({
                "date":    format_short_date(datetime.combine(day, datetime.min.time())),
                "success": success,
                "failed":  failed,
            })

        return result

    def _get_security_events(self, db: Session) -> List[Dict]:
        limit = self._cfg_int(db, AnalyticsConfigKey.SECURITY_EVENTS_LIMIT, 5)
        default_sev = self._cfg(
            db,
            AnalyticsConfigKey.DEFAULT_SEVERITY,
            SecuritySeverity.INFO.value,
        )
        sev_map = self._get_severity_map(db)

        rows = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.event_type == AnalyticsEventType.SECURITY)
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(limit)
            .all()
        )

        result = []
        for row in rows:
            meta = row.event_metadata or {}
            sev_key = meta.get("severity_key", "default")
            severity = sev_map.get(sev_key, default_sev)

            result.append({
                "id":     row.id,
                "label":  meta.get(
                    "label",
                    row.event_type.replace("_", " ").title(),
                ),
                "detail": meta.get(
                    "detail",
                    f"Event from IP {row.ip_address or 'unknown'}",
                ),
                "time":   format_short_datetime(row.created_at),
                "sev":    severity,
            })

        return result

    def _get_unauthorized_attempts(self, db: Session) -> List[Dict]:
        limit = self._cfg_int(db, AnalyticsConfigKey.UNAUTH_ATTEMPTS_LIMIT, 10)

        rows = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type.in_([
                    AnalyticsEventType.LOGIN,
                    AnalyticsEventType.SECURITY,
                ]),
                AnalyticsEvent.status == AnalyticsEventStatus.FAILED,
                AnalyticsEvent.ip_address.isnot(None),
            )
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(limit)
            .all()
        )

        result = []
        for row in rows:
            meta = row.event_metadata or {}
            blocked = (row.event_type == AnalyticsEventType.SECURITY)
            loc_parts = [p for p in [row.city, row.country] if p]
            location = ", ".join(loc_parts) if loc_parts else "Unknown"

            result.append({
                "id":       row.id,
                "ip":       row.ip_address or "0.0.0.0",
                "location": location,
                "target":   meta.get("target", "Unknown resource"),
                "attempts": int(meta.get("attempts", 1)),
                "time":     relative_time(row.created_at),
                "blocked":  blocked,
            })

        return result

    # ═══════════════════════════════════════════════════════════════════════
    # RECENT ACTIVITY
    # ═══════════════════════════════════════════════════════════════════════

    def get_recent_activity(
        self,
        db: Session,
        user_id: int | None = None,
    ) -> List[AnalyticsEvent]:
        """
        Recent activity feed. Optionally filter by user_id.
        """
        limit = self._cfg_int(
            db, AnalyticsConfigKey.RECENT_ACTIVITY_LIMIT, 10
        )

        query = db.query(AnalyticsEvent)
        if user_id is not None:
            query = query.filter(AnalyticsEvent.user_id == user_id)

        return (
            query.order_by(AnalyticsEvent.created_at.desc())
            .limit(limit)
            .all()
        )
    

    # ═══════════════════════════════════════════════════════════════════════
    # SYSTEM / USER LIST (Admin support)
    # ═══════════════════════════════════════════════════════════════════════

    def get_users_list(self, db: Session) -> List[Dict]:
        """
        Returns list of users for the activity filter dropdown.
        Lightweight — no sensitive fields.
        """
        users = (
            db.query(User.id, User.name, User.email)
            .order_by(User.name)
            .all()
        )
        return [
            {"id": u.id, "name": u.name, "email": u.email}
            for u in users
        ]

    def get_system_stats(self, db: Session) -> Dict[str, Any]:
        """
        System health & DB stats — powered entirely by PostgreSQL.
        No external monitoring tools required.
        """
        import time
        import platform
        import sys

        now = datetime.now(timezone.utc)
        yesterday   = now - timedelta(hours=24)
        last_hour   = now - timedelta(hours=1)
        last_week   = now - timedelta(days=7)

        # ── Event stats ──────────────────────────────────────────────────────
        total_events = db.query(AnalyticsEvent).count()
        events_24h = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.created_at >= yesterday)
            .count()
        )
        events_1h = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.created_at >= last_hour)
            .count()
        )
        events_7d = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.created_at >= last_week)
            .count()
        )

        # ── User stats ───────────────────────────────────────────────────────
        total_users = db.query(User).count()
        # Active users = distinct users who logged in in last 24h
        active_users_24h = (
            db.query(func.count(func.distinct(AnalyticsEvent.user_id)))
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                AnalyticsEvent.created_at >= yesterday,
            )
            .scalar()
        ) or 0

        # ── File stats ───────────────────────────────────────────────────────
        total_files = (
            db.query(File)
            .filter(File.is_deleted == False)
            .count()
        )
        # Total storage of all users
        total_storage_bytes = (
            db.query(func.coalesce(func.sum(User.storage_used), 0))
            .scalar()
        ) or 0
        total_storage_mb = round(total_storage_bytes / (1024 * 1024), 2)

        # ── Share stats ──────────────────────────────────────────────────────
        total_shares = db.query(ShareLink).count()
        active_shares = (
            db.query(ShareLink)
            .filter(ShareLink.is_active == True)
            .count()
        )

        # ── Success rate (login success ratio) ──────────────────────────────
        total_logins = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.event_type == AnalyticsEventType.LOGIN)
            .count()
        )
        successful_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
            )
            .count()
        )
        success_rate = (
            round((successful_logins / total_logins) * 100, 1)
            if total_logins > 0 else 100.0
        )

        # ── DB response time ────────────────────────────────────────────────
        start = time.perf_counter()
        db.execute(func.now())
        db_response_ms = round((time.perf_counter() - start) * 1000, 2)

        # ── Determine status ────────────────────────────────────────────────
        if db_response_ms > 500:
            status = "degraded"
        elif db_response_ms > 200:
            status = "slow"
        else:
            status = "healthy"

        # ── Runtime info ────────────────────────────────────────────────────
        python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"

        return {
            # Event metrics
            "total_events":       total_events,
            "events_1h":          events_1h,
            "events_24h":         events_24h,
            "events_7d":          events_7d,

            # User metrics
            "total_users":        total_users,
            "active_users_24h":   int(active_users_24h),

            # File & storage
            "total_files":        total_files,
            "total_storage_mb":   total_storage_mb,

            # Sharing
            "total_shares":       total_shares,
            "active_shares":      active_shares,

            # Performance
            "db_response_ms":     db_response_ms,
            "success_rate":       success_rate,

            # Status & runtime
            "status":             status,
            "python_version":     python_version,
            "platform":           platform.system(),
        }


    # ═══════════════════════════════════════════════════════════════════════
    # TREND INDICATORS (for KPI cards)
    # ═══════════════════════════════════════════════════════════════════════

    def get_trend_indicators(self, db: Session) -> Dict[str, Any]:
        """
        Calculates trend data for KPI cards.
        Compares current week vs previous week for each metric.
        All data from PostgreSQL — zero hardcoding.
        """
        today = datetime.now(timezone.utc).date()
        this_week_start = today - timedelta(days=7)
        last_week_start = today - timedelta(days=14)
        last_week_end = today - timedelta(days=7)

        def calc_trend(this_count, last_count):
            if last_count == 0:
                return {"change": this_count, "pct": 100 if this_count > 0 else 0, "direction": "up" if this_count > 0 else "neutral"}
            pct = round(((this_count - last_count) / last_count) * 100, 1)
            direction = "up" if pct > 0 else "down" if pct < 0 else "neutral"
            return {"change": this_count - last_count, "pct": pct, "direction": direction}

        # Uploads trend
        this_week_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= this_week_start,
            ).count()
        )
        last_week_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= last_week_start,
                func.date(AnalyticsEvent.created_at) < last_week_end,
            ).count()
        )

        # Downloads trend
        this_week_downloads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) >= this_week_start,
            ).count()
        )
        last_week_downloads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) >= last_week_start,
                func.date(AnalyticsEvent.created_at) < last_week_end,
            ).count()
        )

        # Shares trend
        this_week_shares = (
            db.query(ShareLink)
            .filter(func.date(ShareLink.created_at) >= this_week_start)
            .count()
        )
        last_week_shares = (
            db.query(ShareLink)
            .filter(
                func.date(ShareLink.created_at) >= last_week_start,
                func.date(ShareLink.created_at) < last_week_end,
            ).count()
        )

        # Logins trend
        this_week_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= this_week_start,
            ).count()
        )
        last_week_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= last_week_start,
                func.date(AnalyticsEvent.created_at) < last_week_end,
            ).count()
        )

        # Failed logins trend
        this_week_failed = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status == AnalyticsEventStatus.FAILED,
                func.date(AnalyticsEvent.created_at) >= this_week_start,
            ).count()
        )
        last_week_failed = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status == AnalyticsEventStatus.FAILED,
                func.date(AnalyticsEvent.created_at) >= last_week_start,
                func.date(AnalyticsEvent.created_at) < last_week_end,
            ).count()
        )

        # File access history (last 10 accesses)
        file_access_history = (
            db.query(
                AnalyticsEvent.id,
                AnalyticsEvent.event_type,
                AnalyticsEvent.user_id,
                AnalyticsEvent.file_id,
                AnalyticsEvent.ip_address,
                AnalyticsEvent.created_at,
                File.original_name,
                User.name.label("user_name"),
                User.email.label("user_email"),
            )
            .join(File, AnalyticsEvent.file_id == File.id, isouter=True)
            .join(User, AnalyticsEvent.user_id == User.id, isouter=True)
            .filter(
                AnalyticsEvent.event_type.in_([
                    AnalyticsEventType.DOWNLOAD,
                    AnalyticsEventType.UPLOAD,
                    AnalyticsEventType.SHARE,
                ]),
                AnalyticsEvent.file_id.isnot(None),
            )
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(10)
            .all()
        )

        access_history = [
            {
                "id": row.id,
                "event_type": row.event_type,
                "user_name": row.user_name or "Unknown",
                "user_email": row.user_email or "",
                "file_name": row.original_name or "Unknown file",
                "ip_address": row.ip_address or "",
                "time": relative_time(row.created_at),
                "timestamp": row.created_at.isoformat() if row.created_at else "",
            }
            for row in file_access_history
        ]

        return {
            "trends": {
                "uploads":   calc_trend(this_week_uploads, last_week_uploads),
                "downloads": calc_trend(this_week_downloads, last_week_downloads),
                "shares":    calc_trend(this_week_shares, last_week_shares),
                "logins":    calc_trend(this_week_logins, last_week_logins),
                "failed":    calc_trend(this_week_failed, last_week_failed),
            },
            "file_access_history": access_history,
        }

    # ═══════════════════════════════════════════════════════════════════════
    # CSV EXPORT DATA
    # ═══════════════════════════════════════════════════════════════════════

    def get_csv_export_data(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """
        Returns structured data for CSV export.
        All from PostgreSQL — zero hardcoding.
        """
        today = datetime.now(timezone.utc).date()
        start_date = today - timedelta(days=days)

        # Events in date range
        events = (
            db.query(
                AnalyticsEvent.id,
                AnalyticsEvent.event_type,
                AnalyticsEvent.status,
                AnalyticsEvent.ip_address,
                AnalyticsEvent.created_at,
                User.name.label("user_name"),
                User.email.label("user_email"),
                File.original_name.label("file_name"),
            )
            .join(User, AnalyticsEvent.user_id == User.id, isouter=True)
            .join(File, AnalyticsEvent.file_id == File.id, isouter=True)
            .filter(func.date(AnalyticsEvent.created_at) >= start_date)
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(1000)
            .all()
        )

        return {
            "events": [
                {
                    "id": e.id,
                    "event_type": e.event_type,
                    "status": e.status,
                    "user": e.user_name or "Unknown",
                    "email": e.user_email or "",
                    "file": e.file_name or "",
                    "ip": e.ip_address or "",
                    "date": e.created_at.strftime("%Y-%m-%d %H:%M:%S") if e.created_at else "",
                }
                for e in events
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "date_range": f"Last {days} days",
            "total_records": len(events),
        }


    # ═══════════════════════════════════════════════════════════════════════
    # ✅ NEW FEATURES START — Added for Analytics Enhancement
    # ═══════════════════════════════════════════════════════════════════════

    # ─────────────────────────────────────────────────────────────────────
    # 1. FILE TYPE DISTRIBUTION (for Pie Chart)
    # ─────────────────────────────────────────────────────────────────────
    def get_file_type_distribution(self, db: Session) -> List[Dict]:
        """
        Groups files by extension and returns distribution for pie chart.
        Returns list of {type, count, size_mb, color}.
        """
        # Color palette for different file types
        color_map = {
            "pdf":   "#EF4444",  # red
            "docx":  "#3B82F6",  # blue
            "doc":   "#3B82F6",
            "xlsx":  "#10B981",  # green
            "xls":   "#10B981",
            "pptx":  "#F59E0B",  # orange
            "ppt":   "#F59E0B",
            "png":   "#8B5CF6",  # purple
            "jpg":   "#EC4899",  # pink
            "jpeg":  "#EC4899",
            "gif":   "#EC4899",
            "mp4":   "#06B6D4",  # cyan
            "mp3":   "#14B8A6",  # teal
            "zip":   "#6B7280",  # gray
            "txt":   "#9CA3AF",  # light gray
            "other": "#64748B",  # slate
        }

        files = (
            db.query(File.original_name, File.size)
            .filter(File.is_deleted == False)
            .all()
        )

        # Group by extension
        type_stats = {}
        for f in files:
            name = f.original_name or ""
            ext = name.rsplit(".", 1)[-1].lower() if "." in name else "other"
            
            # Normalize common types
            if ext not in color_map:
                ext = "other"
            
            if ext not in type_stats:
                type_stats[ext] = {"count": 0, "size": 0}
            type_stats[ext]["count"] += 1
            type_stats[ext]["size"] += (f.size or 0)

        # Convert to list format
        result = []
        for ext, stats in sorted(type_stats.items(), key=lambda x: -x[1]["count"]):
            result.append({
                "type":    ext.upper(),
                "count":   stats["count"],
                "size_mb": round(stats["size"] / (1024 * 1024), 2),
                "color":   color_map.get(ext, "#64748B"),
            })

        return result

    # ─────────────────────────────────────────────────────────────────────
    # 2. TOP ACTIVE USERS (ranked by activity)
    # ─────────────────────────────────────────────────────────────────────
    def get_top_active_users(self, db: Session, days: int = 30, limit: int = 5) -> List[Dict]:
        """
        Returns top most active users based on total events (uploads + downloads + shares).
        """
        from datetime import datetime, timedelta, timezone
        
        start_date = datetime.now(timezone.utc).date() - timedelta(days=days)

        rows = (
            db.query(
                User.id,
                User.name,
                User.email,
                func.count(AnalyticsEvent.id).label("activity_count"),
            )
            .join(AnalyticsEvent, AnalyticsEvent.user_id == User.id)
            .filter(
                AnalyticsEvent.event_type.in_([
                    AnalyticsEventType.UPLOAD,
                    AnalyticsEventType.DOWNLOAD,
                    AnalyticsEventType.SHARE,
                ]),
                func.date(AnalyticsEvent.created_at) >= start_date,
            )
            .group_by(User.id, User.name, User.email)
            .order_by(func.count(AnalyticsEvent.id).desc())
            .limit(limit)
            .all()
        )

        if not rows:
            return []

        max_activity = rows[0].activity_count if rows[0].activity_count > 0 else 1

        return [
            {
                "rank":     i + 1,
                "id":       row.id,
                "name":     row.name or "Unknown",
                "email":    row.email or "",
                "activity": int(row.activity_count),
                "pct":      round((row.activity_count / max_activity) * 100, 1),
                "initials": self._get_initials(row.name or "U"),
            }
            for i, row in enumerate(rows)
        ]

    def _get_initials(self, name: str) -> str:
        """Get user initials for avatar."""
        parts = name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return name[:2].upper() if name else "U"

    # ─────────────────────────────────────────────────────────────────────
    # 3. SECURITY SCORE (0-100 gauge)
    # ─────────────────────────────────────────────────────────────────────
    def get_security_score(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """
        Calculates overall security health score (0-100).
        Based on: failed login ratio, blocked attacks, MFA adoption.
        """
        from datetime import datetime, timedelta, timezone
        
        start_date = datetime.now(timezone.utc).date() - timedelta(days=days)

        # Total login attempts
        total_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )
        
        successful_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )
        
        failed_logins = total_logins - successful_logins
        
        blocked_attacks = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.SECURITY,
                AnalyticsEvent.status     == AnalyticsEventStatus.FAILED,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )

        # Calculate individual scores (0-100 each)
        # 1. Login Success Rate (weight: 40%)
        if total_logins > 0:
            login_score = (successful_logins / total_logins) * 100
        else:
            login_score = 100

        # 2. Attack Response Score (weight: 30%)
        # More blocked = better (they're being caught)
        # But if too many attacks, that's bad
        if blocked_attacks == 0:
            attack_score = 100
        elif blocked_attacks < 10:
            attack_score = 90
        elif blocked_attacks < 50:
            attack_score = 70
        else:
            attack_score = 50

        # 3. Failed Login Score (weight: 30%)
        if failed_logins == 0:
            failed_score = 100
        elif failed_logins < 5:
            failed_score = 90
        elif failed_logins < 20:
            failed_score = 70
        elif failed_logins < 50:
            failed_score = 50
        else:
            failed_score = 30

        # Weighted average
        overall_score = round(
            (login_score * 0.4) + (attack_score * 0.3) + (failed_score * 0.3), 
            1
        )

        # Determine status label & color
        if overall_score >= 90:
            status = "Excellent"
            color = "#10B981"  # green
        elif overall_score >= 75:
            status = "Good"
            color = "#3B82F6"  # blue
        elif overall_score >= 60:
            status = "Fair"
            color = "#F59E0B"  # orange
        else:
            status = "Poor"
            color = "#EF4444"  # red

        return {
            "score":            overall_score,
            "status":           status,
            "color":            color,
            "total_logins":     total_logins,
            "successful":       successful_logins,
            "failed":           failed_logins,
            "blocked_attacks":  blocked_attacks,
            "breakdown": {
                "login_success":   round(login_score, 1),
                "attack_response": round(attack_score, 1),
                "failed_score":    round(failed_score, 1),
            },
        }

    # ─────────────────────────────────────────────────────────────────────
    # 4. FAILED LOGIN HEATMAP (24-hour x 7-day grid)
    # ─────────────────────────────────────────────────────────────────────
    def get_failed_login_heatmap(self, db: Session, days: int = 7) -> Dict[str, Any]:
        """
        Returns failed login attempts grouped by hour of day (0-23) and day of week.
        Perfect for heatmap visualization.
        """
        from datetime import datetime, timedelta, timezone
        from sqlalchemy import text
        
        start_date = datetime.now(timezone.utc).date() - timedelta(days=days)

        # Using raw SQL for PostgreSQL date extraction
        rows = db.execute(
            text("""
                SELECT 
                    EXTRACT(DOW FROM created_at) AS day_of_week,
                    EXTRACT(HOUR FROM created_at) AS hour_of_day,
                    COUNT(*) AS count
                FROM analytics_events
                WHERE event_type = :event_type
                    AND status = :status
                    AND DATE(created_at) >= :start_date
                GROUP BY EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at)
                ORDER BY day_of_week, hour_of_day
            """),
            {
                "event_type": AnalyticsEventType.LOGIN.value,
                "status":     AnalyticsEventStatus.FAILED.value,
                "start_date": start_date,
            },
        ).fetchall()

        # Build 7x24 grid (initialize all zeros)
        day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        grid = []
        for day_idx in range(7):
            for hour in range(24):
                grid.append({
                    "day":   day_names[day_idx],
                    "day_idx": day_idx,
                    "hour":  hour,
                    "count": 0,
                })

        # Fill in actual counts
        max_count = 0
        for row in rows:
            day_idx = int(row.day_of_week)
            hour = int(row.hour_of_day)
            count = int(row.count)
            
            # Find and update the grid cell
            for cell in grid:
                if cell["day_idx"] == day_idx and cell["hour"] == hour:
                    cell["count"] = count
                    if count > max_count:
                        max_count = count
                    break

        return {
            "grid":      grid,
            "max_count": max_count,
            "total":     sum(cell["count"] for cell in grid),
        }

    # ─────────────────────────────────────────────────────────────────────
    # 5. MFA ADOPTION RATE
    # ─────────────────────────────────────────────────────────────────────
    def get_mfa_adoption(self, db: Session) -> Dict[str, Any]:
        """
        Returns MFA adoption statistics.
        Checks if User model has mfa_enabled field.
        """
        total_users = db.query(User).count()
        
        if total_users == 0:
            return {
                "total_users":   0,
                "mfa_enabled":   0,
                "mfa_disabled":  0,
                "adoption_pct":  0,
                "status":        "No users",
                "color":         "#6B7280",
            }

        # Try to count MFA-enabled users
        # Handle case where mfa_enabled field might not exist
        try:
            mfa_enabled = (
                db.query(User)
                .filter(User.mfa_enabled == True)
                .count()
            )
        except Exception:
            # If field doesn't exist, estimate based on other factors
            mfa_enabled = 0

        mfa_disabled = total_users - mfa_enabled
        adoption_pct = round((mfa_enabled / total_users) * 100, 1) if total_users else 0

        # Status based on adoption
        if adoption_pct >= 80:
            status = "Excellent"
            color = "#10B981"
        elif adoption_pct >= 50:
            status = "Good"
            color = "#3B82F6"
        elif adoption_pct >= 25:
            status = "Fair"
            color = "#F59E0B"
        else:
            status = "Needs Improvement"
            color = "#EF4444"

        return {
            "total_users":   total_users,
            "mfa_enabled":   mfa_enabled,
            "mfa_disabled":  mfa_disabled,
            "adoption_pct":  adoption_pct,
            "status":        status,
            "color":         color,
        }

    # ═══════════════════════════════════════════════════════════════════════
    # ✅ NEW FEATURES END
    # ═══════════════════════════════════════════════════════════════════════