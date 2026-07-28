"""
Shared logging configuration. Call `configure_logging()` once at startup
(done in src/main.py). Every other module just does:
    import logging
    logger = logging.getLogger(__name__)
"""
import logging
import os
import sys

_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def configure_logging() -> None:
    root = logging.getLogger()
    if root.handlers:
        return  # avoid duplicate handlers on --reload

    level = os.getenv("LOG_LEVEL", "INFO").upper()
    root.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(_LOG_FORMAT, datefmt=_DATE_FORMAT))
    root.addHandler(handler)

    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("apscheduler").setLevel(logging.WARNING)
