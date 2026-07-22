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
        """Groups sharing activity by email domain. Colors from DB config."""
        dept_limit = self._cfg_int(db, AnalyticsConfigKey.DEPT_SHARES_LIMIT, 5)
        palette    = self._cfg_json(
            db,
            AnalyticsConfigKey.DEPT_COLOR_PALETTE,
            ["#4F46E5", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"],
        )

        rows = (
            db.query(
                func.split_part(User.email, "@", 2).label("domain"),
                func.count(AnalyticsEvent.id).label("total"),
            )
            .join(AnalyticsEvent, AnalyticsEvent.user_id == User.id)
            .filter(AnalyticsEvent.event_type == AnalyticsEventType.SHARE)
            .group_by(func.split_part(User.email, "@", 2))
            .order_by(func.count(AnalyticsEvent.id).desc())
            .limit(dept_limit)
            .all()
        )

        if not rows:
            return []

        grand_total = sum(r.total for r in rows) or 1
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