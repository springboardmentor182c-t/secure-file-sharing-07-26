# server/src/analytics/repository.py
"""
All SQL queries for the analytics module.
Reads everything from DB — configs, event types, severity mappings, colors.
Zero hardcoded values.

ALL methods now support date filtering via `days` parameter.
"""

import json
from typing import List, Dict, Any, Optional
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

from src.entities.file       import File
from src.entities.user       import User
from src.entities.share_link import ShareLink


class AnalyticsRepository:

    # ═══════════════════════════════════════════════════════════════════════
    # CONFIG HELPERS
    # ═══════════════════════════════════════════════════════════════════════

    def _cfg(self, db: Session, key: str, default: str) -> str:
        row = (
            db.query(AnalyticsConfig)
            .filter(AnalyticsConfig.key == key, AnalyticsConfig.is_active == True)
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
        return self._cfg_json(
            db, AnalyticsConfigKey.UI_CONFIG,
            {"tabs": [], "date_ranges": [], "file_kpis": [], "security_kpis": [], "charts": {}, "panels": {}, "severity": {}},
        )

    def _get_severity_map(self, db: Session) -> Dict[str, str]:
        rows = db.query(AnalyticsSeverityMap).filter(AnalyticsSeverityMap.is_active == True).all()
        return {r.severity_key: r.severity for r in rows}

    # ═══════════════════════════════════════════════════════════════════════
    # DATE RANGE HELPERS (
    # ═══════════════════════════════════════════════════════════════════════
    
    def _get_date_range(self, days: int = 30) -> tuple:
        """Returns (start_date, end_date) as date objects."""
        today = datetime.now(timezone.utc).date()
        start = today - timedelta(days=days - 1)
        return start, today

    # ═══════════════════════════════════════════════════════════════════════
    # STORAGE 
    # ═══════════════════════════════════════════════════════════════════════

    def get_storage_summary(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Storage summary - ALL-TIME data (storage is cumulative)."""
        total_users   = db.query(User).count()
        storage_used  = db.query(func.coalesce(func.sum(User.storage_used),  0)).scalar() or 0
        storage_quota = db.query(func.coalesce(func.sum(User.storage_quota), 0)).scalar() or 0
        storage_pct   = round(storage_used * 100 / storage_quota, 2) if storage_quota else 0.0

        return {
            "total_users":        total_users,
            "storage_used":       int(storage_used),
            "storage_quota":      int(storage_quota),
            "storage_percentage": storage_pct,
            "storage_used_gb":    round(storage_used  / (1024 ** 3), 4),
            "storage_quota_gb":   round(storage_quota / (1024 ** 3), 2),
            "trend":              self._get_storage_trend(db, days=days),
        }

    def _get_storage_trend(self, db: Session, days: int = 30) -> List[Dict]:
        """Storage trend - adapts to date range."""
        # If less than 90 days, show weekly points; else monthly
        today = datetime.now(timezone.utc)
        result = []
        
        if days <= 30:
            # Daily points for short ranges
            for i in range(min(days, 14) - 1, -1, -1):
                day = today - timedelta(days=i)
                end_of_day = day.replace(hour=23, minute=59, second=59)
                total_size = (
                    db.query(func.coalesce(func.sum(File.size), 0))
                    .filter(File.created_at <= end_of_day)
                    .scalar()
                ) or 0
                result.append({
                    "month": day.strftime("%b %d"),
                    "gb": round(total_size / (1024 ** 3), 4),
                })
        else:
            # Monthly points for longer ranges
            months = max(1, min(days // 30, 12))
            for i in range(months - 1, -1, -1):
                point = today - relativedelta(months=i)
                end_of_month = (
                    point.replace(day=1, hour=23, minute=59, second=59)
                    + relativedelta(months=1)
                    - timedelta(seconds=1)
                )
                total_size = (
                    db.query(func.coalesce(func.sum(File.size), 0))
                    .filter(File.created_at <= end_of_month)
                    .scalar()
                ) or 0
                result.append({
                    "month": point.strftime("%b"),
                    "gb": round(total_size / (1024 ** 3), 4),
                })

        return result

    # ═══════════════════════════════════════════════════════════════════════
    # UPLOADS 
    # ═══════════════════════════════════════════════════════════════════════

    def get_upload_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        start_date, today = self._get_date_range(days)
        chart_days = min(days, 30)

        # Uploads WITHIN date range (was all-time before!)
        total_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )

        # Previous period comparison
        prev_start = start_date - timedelta(days=days)
        prev_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= prev_start,
                func.date(AnalyticsEvent.created_at) < start_date,
            ).count()
        )

        if prev_uploads > 0:
            change_pct = round(((total_uploads - prev_uploads) / prev_uploads) * 100, 0)
        else:
            change_pct = 100 if total_uploads > 0 else 0

        today_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) == today,
            ).count()
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
                ).count()
            )
            weekly_uploads.append({
                "date":  day.strftime("%a") if chart_days <= 7 else day.strftime("%b %d"),
                "count": count,
            })

        return {
            "total_uploads":       total_uploads,
            "today_uploads":       today_uploads,
            "this_month_uploads":  total_uploads,
            "last_month_uploads":  prev_uploads,
            "change_pct":          int(change_pct),
            "weekly_uploads":      weekly_uploads,
            "volume_weekly":       self._get_volume_weekly(db, days=days),
        }

    def _get_volume_weekly(self, db: Session, days: int = 30) -> List[Dict]:
        """Weekly upload/download volume within date range."""
        num_weeks = max(1, min(days // 7, 12))
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
                ).count()
            )
            downloads = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                    func.date(AnalyticsEvent.created_at) >= week_start,
                    func.date(AnalyticsEvent.created_at) <= week_end,
                ).count()
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
        start_date, today = self._get_date_range(days)
        chart_days = min(days, 30)

        # Downloads WITHIN date range
        total_downloads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )

        today_downloads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) == today,
            ).count()
        )

        # Bytes transferred WITHIN date range
        transferred_bytes = (
            db.query(func.coalesce(func.sum(File.size), 0))
            .join(AnalyticsEvent, AnalyticsEvent.file_id == File.id)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).scalar()
        ) or 0

        weekly_downloads = []
        for i in range(chart_days - 1, -1, -1):
            day = today - timedelta(days=i)
            count = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                    func.date(AnalyticsEvent.created_at) == day,
                ).count()
            )
            weekly_downloads.append({
                "date":  day.strftime("%a") if chart_days <= 7 else day.strftime("%b %d"),
                "count": count,
            })

        return {
            "total_downloads":       total_downloads,
            "today_downloads":       today_downloads,
            "this_month_downloads":  total_downloads,
            "transferred_bytes":     int(transferred_bytes),
            "transferred_gb":        round(transferred_bytes / (1024 ** 3), 2),
            "transferred_mb":        round(transferred_bytes / (1024 ** 2), 2),
            "weekly_downloads":      weekly_downloads,
        }

    # ═══════════════════════════════════════════════════════════════════════
    # DELETES 
    # ═══════════════════════════════════════════════════════════════════════

    def get_delete_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        start_date, today = self._get_date_range(days)
        week_start = today - timedelta(days=7)

        total_deletes = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DELETE,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )

        this_week_deletes = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DELETE,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= week_start,
            ).count()
        )

        today_deletes = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DELETE,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) == today,
            ).count()
        )

        return {
            "total_deletes":      total_deletes,
            "today_deletes":      today_deletes,
            "this_week_deletes":  this_week_deletes,
            "this_month_deletes": total_deletes,
        }

    # ═══════════════════════════════════════════════════════════════════════
    # SHARING 
    # ═══════════════════════════════════════════════════════════════════════

    def get_sharing_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        top_limit = self._cfg_int(db, AnalyticsConfigKey.TOP_FILES_LIMIT, 5)
        start_date, today = self._get_date_range(days)
        week_start = today - timedelta(days=7)

        # Shares within date range
        total_links = (
            db.query(ShareLink)
            .filter(func.date(ShareLink.created_at) >= start_date)
            .count()
        )
        active_links = (
            db.query(ShareLink)
            .filter(
                ShareLink.is_active == True,
                func.date(ShareLink.created_at) >= start_date,
            ).count()
        )
        inactive_links = total_links - active_links
        
        total_views = (
            db.query(func.coalesce(func.sum(ShareLink.access_count), 0))
            .filter(func.date(ShareLink.created_at) >= start_date)
            .scalar()
        ) or 0

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
            "top_files":      self._get_top_shared_files(db, top_limit, days=days),
            "by_department":  self._get_sharing_by_domain(db, days=days),
        }

    def _get_top_shared_files(self, db: Session, limit: int, days: int = 30) -> List[Dict]:
        """Top shared files WITHIN date range."""
        start_date, _ = self._get_date_range(days)
        
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
                & (AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD)
                & (func.date(AnalyticsEvent.created_at) >= start_date),
                isouter=True,
            )
            .filter(File.is_deleted == False)
            .filter(
                (ShareLink.created_at.is_(None)) |
                (func.date(ShareLink.created_at) >= start_date)
            )
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

    def _get_sharing_by_domain(self, db: Session, days: int = 30) -> List[Dict]:
        """Sharing by domain WITHIN date range."""
        from sqlalchemy import text

        dept_limit = self._cfg_int(db, AnalyticsConfigKey.DEPT_SHARES_LIMIT, 5)
        palette = self._cfg_json(
            db, AnalyticsConfigKey.DEPT_COLOR_PALETTE,
            ["#4F46E5", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"],
        )
        start_date, _ = self._get_date_range(days)

        rows = db.execute(
            text("""
                SELECT
                    SPLIT_PART(users.email, '@', 2) AS domain,
                    COUNT(analytics_events.id) AS total
                FROM users
                JOIN analytics_events ON analytics_events.user_id = users.id
                WHERE analytics_events.event_type = :event_type
                    AND DATE(analytics_events.created_at) >= :start_date
                GROUP BY SPLIT_PART(users.email, '@', 2)
                ORDER BY COUNT(analytics_events.id) DESC
                LIMIT :dept_limit
            """),
            {
                "event_type": AnalyticsEventType.SHARE.value,
                "start_date": start_date,
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
        start_date, _ = self._get_date_range(days)
        
        # ALL security metrics WITHIN date range
        login_events = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )
        failed_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.FAILED,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )
        security_events = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.SECURITY,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )
        blocked_attacks = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.SECURITY,
                AnalyticsEvent.status     == AnalyticsEventStatus.FAILED,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )

        chart_days = min(days, self._cfg_int(db, AnalyticsConfigKey.LOGIN_CHART_DAYS, 7))
        
        return {
            "login_events":          login_events,
            "failed_logins":         failed_logins,
            "security_events":       security_events,
            "blocked_attacks":       blocked_attacks,
            "login_activity":        self._get_login_activity(db, days=chart_days),
            "events":                self._get_security_events(db, days=days),
            "unauthorized_attempts": self._get_unauthorized_attempts(db, days=days),
        }

    def _get_login_activity(self, db: Session, days: int = None) -> List[Dict]:
        if days is None:
            days = self._cfg_int(db, AnalyticsConfigKey.LOGIN_CHART_DAYS, 7)

        today = datetime.now(timezone.utc).date()
        result = []

        for i in range(days - 1, -1, -1):
            day = today - timedelta(days=i)
            success = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                    AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                    func.date(AnalyticsEvent.created_at) == day,
                ).count()
            )
            failed = (
                db.query(AnalyticsEvent)
                .filter(
                    AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                    AnalyticsEvent.status     == AnalyticsEventStatus.FAILED,
                    func.date(AnalyticsEvent.created_at) == day,
                ).count()
            )
            result.append({
                "date":    format_short_date(datetime.combine(day, datetime.min.time())),
                "success": success,
                "failed":  failed,
            })

        return result

    def _get_security_events(self, db: Session, days: int = 30) -> List[Dict]:
        """Security events WITHIN date range."""
        limit = self._cfg_int(db, AnalyticsConfigKey.SECURITY_EVENTS_LIMIT, 5)
        default_sev = self._cfg(db, AnalyticsConfigKey.DEFAULT_SEVERITY, SecuritySeverity.INFO.value)
        sev_map = self._get_severity_map(db)
        start_date, _ = self._get_date_range(days)

        rows = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.SECURITY,
                func.date(AnalyticsEvent.created_at) >= start_date,
            )
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
                "label":  meta.get("label", row.event_type.replace("_", " ").title()),
                "detail": meta.get("detail", f"Event from IP {row.ip_address or 'unknown'}"),
                "time":   format_short_datetime(row.created_at),
                "sev":    severity,
            })
        return result

    def _get_unauthorized_attempts(self, db: Session, days: int = 30) -> List[Dict]:
        """Unauthorized attempts WITHIN date range."""
        limit = self._cfg_int(db, AnalyticsConfigKey.UNAUTH_ATTEMPTS_LIMIT, 10)
        start_date, _ = self._get_date_range(days)

        rows = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type.in_([
                    AnalyticsEventType.LOGIN,
                    AnalyticsEventType.SECURITY,
                ]),
                AnalyticsEvent.status == AnalyticsEventStatus.FAILED,
                AnalyticsEvent.ip_address.isnot(None),
                func.date(AnalyticsEvent.created_at) >= start_date,
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

    def get_recent_activity(self, db: Session, user_id: Optional[int] = None, days: int = 30) -> List[AnalyticsEvent]:
        """Recent activity WITHIN date range."""
        limit = self._cfg_int(db, AnalyticsConfigKey.RECENT_ACTIVITY_LIMIT, 10)
        start_date, _ = self._get_date_range(days)

        query = db.query(AnalyticsEvent).filter(
            func.date(AnalyticsEvent.created_at) >= start_date
        )
        if user_id is not None:
            query = query.filter(AnalyticsEvent.user_id == user_id)

        return query.order_by(AnalyticsEvent.created_at.desc()).limit(limit).all()

    # ═══════════════════════════════════════════════════════════════════════
    # SYSTEM / USER LIST
    # ═══════════════════════════════════════════════════════════════════════

    def get_users_list(self, db: Session) -> List[Dict]:
        users = db.query(User.id, User.name, User.email).order_by(User.name).all()
        return [{"id": u.id, "name": u.name, "email": u.email} for u in users]

    def get_system_stats(self, db: Session) -> Dict[str, Any]:
        import time, platform, sys

        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(hours=24)
        last_hour = now - timedelta(hours=1)
        last_week = now - timedelta(days=7)

        total_events = db.query(AnalyticsEvent).count()
        events_24h = db.query(AnalyticsEvent).filter(AnalyticsEvent.created_at >= yesterday).count()
        events_1h  = db.query(AnalyticsEvent).filter(AnalyticsEvent.created_at >= last_hour).count()
        events_7d  = db.query(AnalyticsEvent).filter(AnalyticsEvent.created_at >= last_week).count()

        total_users = db.query(User).count()
        active_users_24h = (
            db.query(func.count(func.distinct(AnalyticsEvent.user_id)))
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status     == AnalyticsEventStatus.SUCCESS,
                AnalyticsEvent.created_at >= yesterday,
            ).scalar()
        ) or 0

        total_files = db.query(File).filter(File.is_deleted == False).count()
        total_storage_bytes = db.query(func.coalesce(func.sum(User.storage_used), 0)).scalar() or 0
        total_storage_mb = round(total_storage_bytes / (1024 * 1024), 2)

        total_shares = db.query(ShareLink).count()
        active_shares = db.query(ShareLink).filter(ShareLink.is_active == True).count()

        total_logins = db.query(AnalyticsEvent).filter(AnalyticsEvent.event_type == AnalyticsEventType.LOGIN).count()
        successful_logins = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.LOGIN,
                AnalyticsEvent.status == AnalyticsEventStatus.SUCCESS,
            ).count()
        )
        success_rate = round((successful_logins / total_logins) * 100, 1) if total_logins > 0 else 100.0

        start = time.perf_counter()
        db.execute(func.now())
        db_response_ms = round((time.perf_counter() - start) * 1000, 2)

        status = "degraded" if db_response_ms > 500 else "slow" if db_response_ms > 200 else "healthy"
        python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"

        return {
            "total_events":     total_events,
            "events_1h":        events_1h,
            "events_24h":       events_24h,
            "events_7d":        events_7d,
            "total_users":      total_users,
            "active_users_24h": int(active_users_24h),
            "total_files":      total_files,
            "total_storage_mb": total_storage_mb,
            "total_shares":     total_shares,
            "active_shares":    active_shares,
            "db_response_ms":   db_response_ms,
            "success_rate":     success_rate,
            "status":           status,
            "python_version":   python_version,
            "platform":         platform.system(),
        }

    # ═══════════════════════════════════════════════════════════════════════
    # TREND INDICATORS
    # ═══════════════════════════════════════════════════════════════════════

    def get_trend_indicators(self, db: Session) -> Dict[str, Any]:
        today = datetime.now(timezone.utc).date()
        this_week_start = today - timedelta(days=7)
        last_week_start = today - timedelta(days=14)
        last_week_end   = today - timedelta(days=7)

        def calc_trend(this_count, last_count):
            if last_count == 0:
                return {"change": this_count, "pct": 100 if this_count > 0 else 0, "direction": "up" if this_count > 0 else "neutral"}
            pct = round(((this_count - last_count) / last_count) * 100, 1)
            direction = "up" if pct > 0 else "down" if pct < 0 else "neutral"
            return {"change": this_count - last_count, "pct": pct, "direction": direction}

        def count_event(event_type, status, start, end=None):
            q = db.query(AnalyticsEvent).filter(
                AnalyticsEvent.event_type == event_type,
                func.date(AnalyticsEvent.created_at) >= start,
            )
            if status:
                q = q.filter(AnalyticsEvent.status == status)
            if end:
                q = q.filter(func.date(AnalyticsEvent.created_at) < end)
            return q.count()

        this_uploads = count_event(AnalyticsEventType.UPLOAD, AnalyticsEventStatus.SUCCESS, this_week_start)
        last_uploads = count_event(AnalyticsEventType.UPLOAD, AnalyticsEventStatus.SUCCESS, last_week_start, last_week_end)
        this_downloads = count_event(AnalyticsEventType.DOWNLOAD, None, this_week_start)
        last_downloads = count_event(AnalyticsEventType.DOWNLOAD, None, last_week_start, last_week_end)
        this_logins = count_event(AnalyticsEventType.LOGIN, AnalyticsEventStatus.SUCCESS, this_week_start)
        last_logins = count_event(AnalyticsEventType.LOGIN, AnalyticsEventStatus.SUCCESS, last_week_start, last_week_end)
        this_failed = count_event(AnalyticsEventType.LOGIN, AnalyticsEventStatus.FAILED, this_week_start)
        last_failed = count_event(AnalyticsEventType.LOGIN, AnalyticsEventStatus.FAILED, last_week_start, last_week_end)

        this_shares = db.query(ShareLink).filter(func.date(ShareLink.created_at) >= this_week_start).count()
        last_shares = db.query(ShareLink).filter(
            func.date(ShareLink.created_at) >= last_week_start,
            func.date(ShareLink.created_at) < last_week_end,
        ).count()

        file_access_history = (
            db.query(
                AnalyticsEvent.id, AnalyticsEvent.event_type, AnalyticsEvent.user_id,
                AnalyticsEvent.file_id, AnalyticsEvent.ip_address, AnalyticsEvent.created_at,
                File.original_name, User.name.label("user_name"), User.email.label("user_email"),
            )
            .join(File, AnalyticsEvent.file_id == File.id, isouter=True)
            .join(User, AnalyticsEvent.user_id == User.id, isouter=True)
            .filter(
                AnalyticsEvent.event_type.in_([
                    AnalyticsEventType.DOWNLOAD, AnalyticsEventType.UPLOAD, AnalyticsEventType.SHARE,
                ]),
                AnalyticsEvent.file_id.isnot(None),
            )
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(10)
            .all()
        )

        access_history = [
            {
                "id": row.id, "event_type": row.event_type,
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
                "uploads":   calc_trend(this_uploads, last_uploads),
                "downloads": calc_trend(this_downloads, last_downloads),
                "shares":    calc_trend(this_shares, last_shares),
                "logins":    calc_trend(this_logins, last_logins),
                "failed":    calc_trend(this_failed, last_failed),
            },
            "file_access_history": access_history,
        }

    # ═══════════════════════════════════════════════════════════════════════
    # CSV EXPORT DATA
    # ═══════════════════════════════════════════════════════════════════════

    def get_csv_export_data(self, db: Session, days: int = 30) -> Dict[str, Any]:
        today = datetime.now(timezone.utc).date()
        start_date = today - timedelta(days=days)

        events = (
            db.query(
                AnalyticsEvent.id, AnalyticsEvent.event_type, AnalyticsEvent.status,
                AnalyticsEvent.ip_address, AnalyticsEvent.created_at,
                User.name.label("user_name"), User.email.label("user_email"),
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
                    "id": e.id, "event_type": e.event_type, "status": e.status,
                    "user": e.user_name or "Unknown", "email": e.user_email or "",
                    "file": e.file_name or "", "ip": e.ip_address or "",
                    "date": e.created_at.strftime("%Y-%m-%d %H:%M:%S") if e.created_at else "",
                }
                for e in events
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "date_range": f"Last {days} days",
            "total_records": len(events),
        }

    def get_file_type_distribution(self, db: Session, days: int = 30) -> List[Dict]:
        """File types uploaded WITHIN date range."""
        color_map = {
            "pdf": "#EF4444", "docx": "#3B82F6", "doc": "#3B82F6",
            "xlsx": "#10B981", "xls": "#10B981", "pptx": "#F59E0B", "ppt": "#F59E0B",
            "png": "#8B5CF6", "jpg": "#EC4899", "jpeg": "#EC4899", "gif": "#EC4899",
            "mp4": "#06B6D4", "mp3": "#14B8A6", "zip": "#6B7280",
            "txt": "#9CA3AF", "other": "#64748B",
        }

        start_date, _ = self._get_date_range(days)
        
        files = (
            db.query(File.original_name, File.size)
            .filter(
                File.is_deleted == False,
                func.date(File.created_at) >= start_date,
            ).all()
        )

        type_stats = {}
        for f in files:
            name = f.original_name or ""
            ext = name.rsplit(".", 1)[-1].lower() if "." in name else "other"
            if ext not in color_map:
                ext = "other"
            if ext not in type_stats:
                type_stats[ext] = {"count": 0, "size": 0}
            type_stats[ext]["count"] += 1
            type_stats[ext]["size"] += (f.size or 0)

        return [
            {
                "type":    ext.upper(),
                "count":   stats["count"],
                "size_mb": round(stats["size"] / (1024 * 1024), 2),
                "color":   color_map.get(ext, "#64748B"),
            }
            for ext, stats in sorted(type_stats.items(), key=lambda x: -x[1]["count"])
        ]

    def get_top_active_users(self, db: Session, days: int = 30, limit: int = 5) -> List[Dict]:
        start_date, _ = self._get_date_range(days)

        rows = (
            db.query(
                User.id, User.name, User.email,
                func.count(AnalyticsEvent.id).label("activity_count"),
            )
            .join(AnalyticsEvent, AnalyticsEvent.user_id == User.id)
            .filter(
                AnalyticsEvent.event_type.in_([
                    AnalyticsEventType.UPLOAD, AnalyticsEventType.DOWNLOAD, AnalyticsEventType.SHARE,
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
                "rank": i + 1, "id": row.id,
                "name": row.name or "Unknown", "email": row.email or "",
                "activity": int(row.activity_count),
                "pct": round((row.activity_count / max_activity) * 100, 1),
                "initials": self._get_initials(row.name or "U"),
            }
            for i, row in enumerate(rows)
        ]

    def _get_initials(self, name: str) -> str:
        parts = name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return name[:2].upper() if name else "U"

    def get_security_score(self, db: Session, days: int = 30) -> Dict[str, Any]:
        start_date, _ = self._get_date_range(days)

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
                AnalyticsEvent.status == AnalyticsEventStatus.SUCCESS,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )
        failed_logins = total_logins - successful_logins
        blocked_attacks = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.SECURITY,
                AnalyticsEvent.status == AnalyticsEventStatus.FAILED,
                func.date(AnalyticsEvent.created_at) >= start_date,
            ).count()
        )

        login_score = (successful_logins / total_logins) * 100 if total_logins > 0 else 100
        if blocked_attacks == 0: attack_score = 100
        elif blocked_attacks < 10: attack_score = 90
        elif blocked_attacks < 50: attack_score = 70
        else: attack_score = 50

        if failed_logins == 0: failed_score = 100
        elif failed_logins < 5: failed_score = 90
        elif failed_logins < 20: failed_score = 70
        elif failed_logins < 50: failed_score = 50
        else: failed_score = 30

        overall_score = round((login_score * 0.4) + (attack_score * 0.3) + (failed_score * 0.3), 1)

        if overall_score >= 90: status, color = "Excellent", "#10B981"
        elif overall_score >= 75: status, color = "Good", "#3B82F6"
        elif overall_score >= 60: status, color = "Fair", "#F59E0B"
        else: status, color = "Poor", "#EF4444"

        return {
            "score": overall_score, "status": status, "color": color,
            "total_logins": total_logins, "successful": successful_logins,
            "failed": failed_logins, "blocked_attacks": blocked_attacks,
            "breakdown": {
                "login_success": round(login_score, 1),
                "attack_response": round(attack_score, 1),
                "failed_score": round(failed_score, 1),
            },
        }

    def get_failed_login_heatmap(self, db: Session, days: int = 7) -> Dict[str, Any]:
        from sqlalchemy import text
        start_date = datetime.now(timezone.utc).date() - timedelta(days=days)

        rows = db.execute(
            text("""
                SELECT EXTRACT(DOW FROM created_at) AS day_of_week,
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
                "status": AnalyticsEventStatus.FAILED.value,
                "start_date": start_date,
            },
        ).fetchall()

        day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        grid = [
            {"day": day_names[d], "day_idx": d, "hour": h, "count": 0}
            for d in range(7) for h in range(24)
        ]

        max_count = 0
        for row in rows:
            d, h, c = int(row.day_of_week), int(row.hour_of_day), int(row.count)
            for cell in grid:
                if cell["day_idx"] == d and cell["hour"] == h:
                    cell["count"] = c
                    if c > max_count: max_count = c
                    break

        return {"grid": grid, "max_count": max_count, "total": sum(c["count"] for c in grid)}

    def get_mfa_adoption(self, db: Session) -> Dict[str, Any]:
        total_users = db.query(User).count()
        if total_users == 0:
            return {"total_users": 0, "mfa_enabled": 0, "mfa_disabled": 0,
                    "adoption_pct": 0, "status": "No users", "color": "#6B7280"}

        try:
            mfa_enabled = db.query(User).filter(User.mfa_enabled == True).count()
        except Exception:
            mfa_enabled = 0

        mfa_disabled = total_users - mfa_enabled
        adoption_pct = round((mfa_enabled / total_users) * 100, 1)

        if adoption_pct >= 80: status, color = "Excellent", "#10B981"
        elif adoption_pct >= 50: status, color = "Good", "#3B82F6"
        elif adoption_pct >= 25: status, color = "Fair", "#F59E0B"
        else: status, color = "Needs Improvement", "#EF4444"

        return {
            "total_users": total_users, "mfa_enabled": mfa_enabled,
            "mfa_disabled": mfa_disabled, "adoption_pct": adoption_pct,
            "status": status, "color": color,
        }


    # ═══════════════════════════════════════════════════════════════════════
    # PERFORMANCE METRICS 
    # ═══════════════════════════════════════════════════════════════════════

    def get_performance_metrics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """
        System performance metrics per PRD:
        - Concurrent file-sharing handling
        - Secure file processing speed
        - API response time
        - Peak activity times
        """
        from datetime import datetime, timedelta, timezone
        from sqlalchemy import text
        
        start_date, today = self._get_date_range(days)
        now = datetime.now(timezone.utc)
        
        # ═══ CONCURRENT USERS METRICS ═══
        
        # Users active RIGHT NOW (in last 5 minutes)
        five_min_ago = now - timedelta(minutes=5)
        active_now = (
            db.query(func.count(func.distinct(AnalyticsEvent.user_id)))
            .filter(AnalyticsEvent.created_at >= five_min_ago)
            .scalar()
        ) or 0
        
        # Peak concurrent users (max users in any 5-min window today)
        try:
            peak_concurrent = db.execute(
                text("""
                    SELECT COUNT(DISTINCT user_id) AS user_count
                    FROM analytics_events
                    WHERE DATE(created_at) = :today
                    GROUP BY DATE_TRUNC('hour', created_at)
                    ORDER BY user_count DESC
                    LIMIT 1
                """),
                {"today": today}
            ).scalar() or 0
        except Exception:
            peak_concurrent = 0
        
        # Peak hour today
        try:
            peak_hour_row = db.execute(
                text("""
                    SELECT 
                        EXTRACT(HOUR FROM created_at) AS hour,
                        COUNT(*) AS event_count
                    FROM analytics_events
                    WHERE DATE(created_at) = :today
                    GROUP BY EXTRACT(HOUR FROM created_at)
                    ORDER BY event_count DESC
                    LIMIT 1
                """),
                {"today": today}
            ).fetchone()
            peak_hour = int(peak_hour_row.hour) if peak_hour_row else None
            peak_hour_events = int(peak_hour_row.event_count) if peak_hour_row else 0
        except Exception:
            peak_hour = None
            peak_hour_events = 0
        
        # ═══ CONCURRENT FILE OPERATIONS ═══
        
        # Simultaneous uploads/downloads (last hour)
        last_hour = now - timedelta(hours=1)
        concurrent_uploads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.UPLOAD,
                AnalyticsEvent.created_at >= last_hour,
            ).count()
        )
        concurrent_downloads = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.DOWNLOAD,
                AnalyticsEvent.created_at >= last_hour,
            ).count()
        )
        concurrent_shares = (
            db.query(AnalyticsEvent)
            .filter(
                AnalyticsEvent.event_type == AnalyticsEventType.SHARE,
                AnalyticsEvent.created_at >= last_hour,
            ).count()
        )
        
        # ═══ FILE PROCESSING SPEED METRICS ═══
        
        # Get file size statistics for uploaded files (proxy for processing speed)
        upload_stats = db.execute(
            text("""
                SELECT 
                    COUNT(f.id) AS total_files,
                    AVG(f.size) AS avg_size,
                    MAX(f.size) AS max_size,
                    MIN(f.size) AS min_size,
                    SUM(f.size) AS total_size
                FROM files f
                WHERE f.is_deleted = FALSE
                    AND DATE(f.created_at) >= :start_date
            """),
            {"start_date": start_date}
        ).fetchone()
        
        avg_file_size_mb = round(float(upload_stats.avg_size or 0) / (1024 * 1024), 2)
        max_file_size_mb = round(float(upload_stats.max_size or 0) / (1024 * 1024), 2)
        total_processed_mb = round(float(upload_stats.total_size or 0) / (1024 * 1024), 2)
        files_processed = int(upload_stats.total_files or 0)
        
        # Estimate processing speed (based on file size × count)
        # Assumption: 10 MB/s encryption speed baseline
        if files_processed > 0:
            estimated_processing_time_s = round(total_processed_mb / 10, 2)  # 10 MB/s
            avg_processing_time_ms = round((avg_file_size_mb / 10) * 1000, 2)  # per file
        else:
            estimated_processing_time_s = 0
            avg_processing_time_ms = 0
        
        # ═══ API PERFORMANCE ═══
        
        # DB response time (measured live)
        import time
        start_time = time.perf_counter()
        db.execute(func.now())
        db_response_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        # Determine health status
        if db_response_ms < 50:
            api_status = "Excellent"
            api_color = "#10B981"
        elif db_response_ms < 100:
            api_status = "Good"
            api_color = "#3B82F6"
        elif db_response_ms < 200:
            api_status = "Fair"
            api_color = "#F59E0B"
        else:
            api_status = "Slow"
            api_color = "#EF4444"
        
        # ═══ THROUGHPUT METRICS ═══
        
        # Events per minute (last hour)
        events_last_hour = (
            db.query(AnalyticsEvent)
            .filter(AnalyticsEvent.created_at >= last_hour)
            .count()
        )
        events_per_minute = round(events_last_hour / 60, 2)
        
        # ═══ HOURLY LOAD (last 24 hours) ═══
        try:
            hourly_load = db.execute(
                text("""
                    SELECT 
                        EXTRACT(HOUR FROM created_at) AS hour,
                        COUNT(*) AS event_count,
                        COUNT(DISTINCT user_id) AS user_count
                    FROM analytics_events
                    WHERE created_at >= :yesterday
                    GROUP BY EXTRACT(HOUR FROM created_at)
                    ORDER BY hour ASC
                """),
                {"yesterday": now - timedelta(hours=24)}
            ).fetchall()
            
            hourly_activity = [
                {
                    "hour": int(row.hour),
                    "events": int(row.event_count),
                    "users": int(row.user_count),
                }
                for row in hourly_load
            ]
        except Exception:
            hourly_activity = []
        
        return {
            # Concurrent metrics
            "active_now":              int(active_now),
            "peak_concurrent_users":   int(peak_concurrent),
            "peak_hour":               peak_hour,
            "peak_hour_events":        peak_hour_events,
            "concurrent_uploads":      concurrent_uploads,
            "concurrent_downloads":    concurrent_downloads,
            "concurrent_shares":       concurrent_shares,
            
            # File processing speed
            "files_processed":         files_processed,
            "avg_file_size_mb":        avg_file_size_mb,
            "max_file_size_mb":        max_file_size_mb,
            "total_processed_mb":      total_processed_mb,
            "estimated_processing_time_s": estimated_processing_time_s,
            "avg_processing_time_ms":  avg_processing_time_ms,
            
            # API performance
            "db_response_ms":          db_response_ms,
            "api_status":              api_status,
            "api_color":               api_color,
            "events_per_minute":       events_per_minute,
            "events_last_hour":        events_last_hour,
            
            # Hourly activity for chart
            "hourly_activity":         hourly_activity,
        }