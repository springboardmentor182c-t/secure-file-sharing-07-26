# server/src/analytics/seed/seed_demo_data.py
"""
Generates realistic demo analytics events so the dashboard has data to show.
Safe to run multiple times — only inserts if events table is empty.
Remove or skip in production.
"""

import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from src.analytics.models.analytics_event import AnalyticsEvent
from src.analytics.constants import AnalyticsEventType, AnalyticsEventStatus
from src.entities.user import User


# Realistic demo pool
IPS = [
    ("91.108.56.183",  "Kyiv",      "UA"),
    ("180.163.10.88",  "Shanghai",  "CN"),
    ("82.132.10.44",   "London",    "UK"),
    ("104.28.91.99",   "New York",  "US"),
    ("52.14.22.101",   "Berlin",    "DE"),
    ("13.107.42.14",   "Sydney",    "AU"),
]

BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"]
OS       = ["Windows",  "macOS",   "Linux",  "iOS", "Android"]

SEC_EVENT_PRESETS = [
    {"severity_key": "brute_force",    "label": "Brute force blocked",    "detail": "8 attempts from Kyiv, UA",                  "target": "alex@acme.com",       "attempts": 8, "status": AnalyticsEventStatus.FAILED},
    {"severity_key": "new_device",     "label": "Login from new device",  "detail": "Chrome on Windows · NYC · 104.28.91.42",    "target": "sarah@acme.com",      "attempts": 1, "status": AnalyticsEventStatus.SUCCESS},
    {"severity_key": "external_link",  "label": "External link accessed", "detail": "Brand-Assets.zip opened from London, UK",   "target": "Brand-Assets.zip",    "attempts": 1, "status": AnalyticsEventStatus.SUCCESS},
    {"severity_key": "unusual_access", "label": "Unusual access pattern", "detail": "12 files accessed in 4 min by partner user","target": "Finance Reports/",    "attempts": 12,"status": AnalyticsEventStatus.WARNING},
    {"severity_key": "admin_role",     "label": "Admin role granted",     "detail": "New admin access provisioned",              "target": "system",              "attempts": 1, "status": AnalyticsEventStatus.SUCCESS},
]

UNAUTH_PRESETS = [
    {"target": "alex@acme.com",     "attempts": 8,  "hours_ago": 2,  "blocked": True},
    {"target": "Finance Reports/",  "attempts": 12, "hours_ago": 5,  "blocked": True},
    {"target": "Brand-Assets.zip",  "attempts": 3,  "hours_ago": 30, "blocked": False},
    {"target": "alex@acme.com",     "attempts": 2,  "hours_ago": 50, "blocked": False},
]


def seed_demo_data(db: Session, force: bool = False):
    """
    Seeds demo analytics events.
    Set force=True to add more events even if table has data.
    """
    existing = db.query(AnalyticsEvent).count()
    if existing > 0 and not force:
        print(f"  ↷ analytics_events already has {existing} rows — skipping demo seed")
        return

    users = db.query(User).all()
    if not users:
        print("  ⚠ No users in DB — cannot seed demo events (need at least 1 user)")
        return

    user_ids = [u.id for u in users]
    now = datetime.now(timezone.utc)
    events_added = 0

    # ── 1. LOGIN events — last 6 days (success + failed) ─────────────────────
    for day_offset in range(6):
        day = now - timedelta(days=day_offset)
        success_count = random.randint(180, 320)
        failed_count  = random.randint(5, 25)

        for _ in range(success_count):
            ip, city, country = random.choice(IPS)
            ts = day - timedelta(
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )
            db.add(AnalyticsEvent(
                event_type       = AnalyticsEventType.LOGIN,
                user_id          = random.choice(user_ids),
                status           = AnalyticsEventStatus.SUCCESS,
                ip_address       = ip,
                city             = city,
                country          = country,
                browser          = random.choice(BROWSERS),
                operating_system = random.choice(OS),
                created_at       = ts,
            ))
            events_added += 1

        for _ in range(failed_count):
            ip, city, country = random.choice(IPS)
            ts = day - timedelta(
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )
            db.add(AnalyticsEvent(
                event_type       = AnalyticsEventType.LOGIN,
                user_id          = random.choice(user_ids),
                status           = AnalyticsEventStatus.FAILED,
                ip_address       = ip,
                city             = city,
                country          = country,
                event_metadata   = {"target": "alex@acme.com", "attempts": random.randint(1, 5)},
                created_at       = ts,
            ))
            events_added += 1

    # ── 2. DOWNLOAD events — last 7 days ─────────────────────────────────────
    for day_offset in range(7):
        day = now - timedelta(days=day_offset)
        for _ in range(random.randint(20, 60)):
            ts = day - timedelta(
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )
            db.add(AnalyticsEvent(
                event_type = AnalyticsEventType.DOWNLOAD,
                user_id    = random.choice(user_ids),
                status     = AnalyticsEventStatus.SUCCESS,
                created_at = ts,
            ))
            events_added += 1

    # ── 3. SHARE events — spread across users (for department donut) ─────────
    for _ in range(80):
        ts = now - timedelta(days=random.randint(0, 30))
        db.add(AnalyticsEvent(
            event_type = AnalyticsEventType.SHARE,
            user_id    = random.choice(user_ids),
            status     = AnalyticsEventStatus.SUCCESS,
            created_at = ts,
        ))
        events_added += 1

    # ── 4. SECURITY events — for the timeline ────────────────────────────────
    for i, preset in enumerate(SEC_EVENT_PRESETS):
        ts = now - timedelta(hours=i * 4)
        db.add(AnalyticsEvent(
            event_type     = AnalyticsEventType.SECURITY,
            user_id        = random.choice(user_ids),
            status         = preset["status"],
            ip_address     = random.choice(IPS)[0],
            event_metadata = {
                "severity_key": preset["severity_key"],
                "label":        preset["label"],
                "detail":       preset["detail"],
                "target":       preset["target"],
                "attempts":     preset["attempts"],
            },
            created_at     = ts,
        ))
        events_added += 1

    # ── 5. Unauthorized attempts (FAILED SECURITY for the table) ─────────────
    for preset in UNAUTH_PRESETS:
        ip, city, country = random.choice(IPS)
        ts = now - timedelta(hours=preset["hours_ago"])
        event_type = AnalyticsEventType.SECURITY if preset["blocked"] else AnalyticsEventType.LOGIN
        db.add(AnalyticsEvent(
            event_type     = event_type,
            user_id        = random.choice(user_ids),
            status         = AnalyticsEventStatus.FAILED,
            ip_address     = ip,
            city           = city,
            country        = country,
            event_metadata = {
                "severity_key": "brute_force" if preset["blocked"] else "login_failed",
                "target":       preset["target"],
                "attempts":     preset["attempts"],
            },
            created_at     = ts,
        ))
        events_added += 1

    db.commit()
    print(f"  ✓ Seeded {events_added} demo analytics events")