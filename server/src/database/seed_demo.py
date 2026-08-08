"""
Seed script to insert rich demo data into dev.db
(Users, Files, Shared Links, Security Events, Analytics Telemetry)
"""
import uuid
from datetime import datetime
from src.database.core import get_db, engine, Base
from src.entities.user import User
from src.entities.file import File
from src.entities.shared_link import SharedLink
from src.entities.security_event import SecurityEvent
from src.shared_links.constants import LinkPermission, LinkStatus

def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())

    # Ensure demo user exists
    user = db.query(User).first()
    if not user:
        user = User(
            id=uuid.uuid4(),
            username="admin",
            email="admin@trustshare.com",
            full_name="Admin User",
            account_status="ACTIVE"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Seed sample security events if empty
    if db.query(SecurityEvent).count() == 0:
        events = [
            SecurityEvent(ts=datetime.now().strftime("%Y-%m-%d %H:%M"), event="Unauthorized SSH login attempt", source="192.168.1.100", country="US", severity="high", blocked=True),
            SecurityEvent(ts=datetime.now().strftime("%Y-%m-%d %H:%M"), event="Brute force login attempt detected", source="10.0.0.45", country="UK", severity="critical", blocked=True),
            SecurityEvent(ts=datetime.now().strftime("%Y-%m-%d %H:%M"), event="Successful admin authentication", source="127.0.0.1", country="US", severity="low", blocked=False),
            SecurityEvent(ts=datetime.now().strftime("%Y-%m-%d %H:%M"), event="Encryption key rotated automatically", source="system", country="US", severity="info", blocked=False),
        ]
        for e in events:
            db.add(e)

    # Seed sample files & shared links if empty
    if db.query(SharedLink).count() == 0:
        file1 = File(
            id=uuid.uuid4(),
            owner_id=user.id,
            file_name="Q3_Financial_Audit_Report.pdf",
            original_name="Q3_Financial_Audit_Report.pdf",
            file_extension="pdf",
            mime_type="application/pdf",
            file_size=4194304,
            storage_path="/storage/demo/Q3_Financial_Audit_Report.pdf"
        )
        file2 = File(
            id=uuid.uuid4(),
            owner_id=user.id,
            file_name="System_Architecture_Diagram.png",
            original_name="System_Architecture_Diagram.png",
            file_extension="png",
            mime_type="image/png",
            file_size=1572864,
            storage_path="/storage/demo/System_Architecture_Diagram.png"
        )
        db.add(file1)
        db.add(file2)
        db.commit()

        link1 = SharedLink(
            id=uuid.uuid4(),
            owner_id=user.id,
            file_id=file1.id,
            permission=LinkPermission.VIEW,
            status=LinkStatus.ACTIVE,
            views=18,
            downloads=7,
            created_at=datetime.now()
        )
        link2 = SharedLink(
            id=uuid.uuid4(),
            owner_id=user.id,
            file_id=file2.id,
            permission=LinkPermission.DOWNLOAD,
            status=LinkStatus.ACTIVE,
            views=42,
            downloads=19,
            created_at=datetime.now()
        )
        db.add(link1)
        db.add(link2)

    db.commit()
    print("Rich Demo Data successfully seeded into dev.db!")

if __name__ == "__main__":
    seed_demo_data()
