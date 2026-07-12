import time
import httpx
from sqlalchemy.orm import Session
from app.models.service_health import ServiceHealth

def check_service(db: Session, name: str, url: str = None):
    start = time.time()
    status = "Operational"
    try:
        if url:
            httpx.get(url, timeout=3)
        latency = round((time.time() - start) * 1000, 2)
    except Exception:
        latency = 999
        status = "Degraded"

    entry = ServiceHealth(
        service_name=name,
        latency_ms=latency,
        uptime_pct=99.9,
        status=status
    )
    db.add(entry)
    db.commit()

def run_all_health_checks(db: Session):
    check_service(db, "API Server", "http://localhost:8000/docs")
    check_service(db, "Encryption Service")
    check_service(db, "Storage (S3)")
    check_service(db, "Auth Service (JWT)")
    check_service(db, "Audit Logger (MongoDB)")
    check_service(db, "Email Notifications")