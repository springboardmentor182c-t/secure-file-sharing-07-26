# server/src/analytics/utils/time_helpers.py
"""
Reusable time formatting helpers used across analytics queries.
"""

from datetime import datetime, timezone


def relative_time(dt: datetime) -> str:
    """
    Convert a datetime to human-readable relative time.
    Examples: 'Just now', '5 min ago', '3 hrs ago', 'Yesterday', '3 days ago', 'Jan 6'
    """
    if dt is None:
        return "Unknown"

    # Make sure both datetimes are timezone-aware
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    now   = datetime.now(timezone.utc)
    delta = now - dt
    secs  = delta.total_seconds()

    if secs < 60:
        return "Just now"
    if secs < 3600:
        mins = int(secs / 60)
        return f"{mins} min ago"
    if secs < 86400:
        hrs = int(secs / 3600)
        return f"{hrs} hr{'s' if hrs > 1 else ''} ago"
    if delta.days == 1:
        return "Yesterday"
    if delta.days < 7:
        return f"{delta.days} days ago"

    return dt.strftime("%b %-d") if hasattr(dt, "strftime") else dt.isoformat()


def format_short_datetime(dt: datetime) -> str:
    """
    Format a datetime as 'Jan 6, 9:14 AM' (cross-platform safe).
    """
    if dt is None:
        return ""

    # Windows doesn't support %-d, so we format manually
    day = dt.day
    hour = dt.hour % 12 or 12
    ampm = "AM" if dt.hour < 12 else "PM"
    month = dt.strftime("%b")
    return f"{month} {day}, {hour}:{dt.minute:02d} {ampm}"


def format_short_date(dt: datetime) -> str:
    """
    Format a datetime as 'Jan 6' (cross-platform safe).
    """
    if dt is None:
        return ""
    return f"{dt.strftime('%b')} {dt.day}"