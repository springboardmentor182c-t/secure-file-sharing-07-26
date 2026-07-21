"""
Background job: checks for links nearing expiration / already expired, and
runs every `EXPIRATION_CHECK_INTERVAL_MINUTES` minutes (default 60) via
APScheduler's BackgroundScheduler — a thread-based scheduler that fits this
project's synchronous request/DB stack (no asyncio event loop needed).

Started/stopped from the FastAPI lifespan in src/main.py.
"""
import logging
import os

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from src.database.core import SessionLocal
from src.shared_links import email_service, service
from src.shared_links.constants import LinkStatus, NotificationType
from src.shared_links.notification_service import create_notification
from src.shared_links.utils import build_share_url, hours_until

logger = logging.getLogger("app.scheduler")

SCHEDULER_ENABLED = os.getenv("SCHEDULER_ENABLED", "true").lower() == "true"
CHECK_INTERVAL_MINUTES = int(os.getenv("EXPIRATION_CHECK_INTERVAL_MINUTES", "60"))
EXPIRY_WARNING_HOURS = int(os.getenv("EXPIRY_WARNING_HOURS", "24"))

scheduler = BackgroundScheduler()


def run_expiration_check() -> None:
    """The job body — also callable directly for manual testing."""
    db = SessionLocal()
    try:
        _warn_expiring_links(db)
        _expire_overdue_links(db)
    except Exception:
        logger.exception("Expiration check job failed")
        db.rollback()
    finally:
        db.close()


def _warn_expiring_links(db) -> None:
    links = service.get_links_expiring_soon_unwarned(db, EXPIRY_WARNING_HOURS)
    for link in links:
        hours_left = max(0, round(hours_until(link.expires_at) or 0))
        create_notification(
            db, user_id=link.owner_id, shared_link_id=link.id, type_=NotificationType.WARNING,
            title="Link expiring soon",
            message=f'Your link for "{link.file.file_name}" expires in about {hours_left} hours.',
        )
        if link.recipient_email:
            email_service.send_expiry_warning(
                to_email=link.recipient_email, file_name=link.file.file_name,
                share_url=build_share_url(link.id), hours_left=hours_left,
            )
        link.expiry_warning_sent = True
        db.commit()
        logger.info("Sent expiry warning for link %s (%s hours left)", link.id, hours_left)


def _expire_overdue_links(db) -> None:
    links = service.get_newly_expired_links(db)
    for link in links:
        link.status = LinkStatus.EXPIRED
        create_notification(
            db, user_id=link.owner_id, shared_link_id=link.id, type_=NotificationType.EXPIRED,
            title="Link expired", message=f'Your link for "{link.file.file_name}" has expired.',
        )
        if link.recipient_email:
            email_service.send_expired_notice(to_email=link.recipient_email, file_name=link.file.file_name)
        link.expired_notice_sent = True
        db.commit()
        logger.info("Marked link %s as expired", link.id)


def start_scheduler() -> None:
    if not SCHEDULER_ENABLED:
        logger.info("Scheduler disabled via SCHEDULER_ENABLED=false")
        return
    scheduler.add_job(
        run_expiration_check, trigger=IntervalTrigger(minutes=CHECK_INTERVAL_MINUTES),
        id="expiration_check", replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — expiration check every %s minutes", CHECK_INTERVAL_MINUTES)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
