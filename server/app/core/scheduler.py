from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.services.health_checker import run_all_health_checks

def scheduled_health_check():
    db = SessionLocal()
    try:
        run_all_health_checks(db)
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(scheduled_health_check, "interval", minutes=5)
    scheduler.start()