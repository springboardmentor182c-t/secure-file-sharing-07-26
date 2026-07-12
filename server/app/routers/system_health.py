from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database import get_db
from app.models.service_health import ServiceHealth
from app.schemas.system_health import ServiceHealthOut

router = APIRouter(prefix="/api/system-health", tags=["system-health"])

@router.get("/", response_model=List[ServiceHealthOut])
def get_system_health(db: Session = Depends(get_db)):
    services = ["API Server", "Encryption Service", "Storage (S3)",
                "Auth Service (JWT)", "Audit Logger (MongoDB)", "Email Notifications"]
    results = []
    for name in services:
        latest = (
            db.query(ServiceHealth)
            .filter(ServiceHealth.service_name == name)
            .order_by(desc(ServiceHealth.checked_at))
            .first()
        )
        if latest:
            results.append(latest)
    return results