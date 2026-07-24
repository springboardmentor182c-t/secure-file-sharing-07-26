"""
Background job: permanently deletes (DB row + storage blob) any file
that's been sitting in Trash longer than TRASH_RETENTION_DAYS. Runs on its
own APScheduler instance, started/stopped from the FastAPI lifespan in
src/main.py alongside the Shared Links expiration scheduler.
"""
import logging
import os

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from src.database.core import SessionLocal
from src.files.service import purge_expired_trash

logger = logging.getLogger("app.files_scheduler")

SCHEDULER_ENABLED = os.getenv("SCHEDULER_ENABLED", "true").lower() == "true"
CHECK_INTERVAL_HOURS = int(os.getenv("TRASH_PURGE_INTERVAL_HOURS", "24"))

scheduler = BackgroundScheduler()


def run_trash_purge() -> None:
    db = SessionLocal()
    try:
        purged = purge_expired_trash(db)
        if purged:
            logger.info("Permanently purged %s file(s) from Trash", purged)
    except Exception:
        logger.exception("Trash purge job failed")
        db.rollback()
    finally:
        db.close()


def start_scheduler() -> None:
    if not SCHEDULER_ENABLED:
        return
    scheduler.add_job(
        run_trash_purge, trigger=IntervalTrigger(hours=CHECK_INTERVAL_HOURS),
        id="trash_purge", replace_existing=True,
    )
    scheduler.start()
    logger.info("Files scheduler started — trash purge every %s hours", CHECK_INTERVAL_HOURS)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
