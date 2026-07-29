import uuid
from datetime import datetime, timedelta, timezone
from src.database.core import SessionLocal
from src.entities.user import User
from src.entities.folder import Folder
from src.entities.file import File
from src.entities.audit_log import AuditLog
from src.auth.dependencies import hash_password


def seed_admin_data():
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already contains user records. Skipping seed.")
            return

        now = datetime.now(timezone.utc)

        # 1. Create Sample Users
        users_data = [
            {
                "name": "Sarah Connor",
                "email": "sarah.connor@secureshare.io",
                "role": "admin",
                "plan": "enterprise",
                "is_active": True,
                "mfa_enabled": True,
                "storage_used": 1572864000,
                "storage_quota": 53687091200,
                "avatar_color": "#3b82f6",
            },
            {
                "name": "Alex Mercer",
                "email": "alex.mercer@secureshare.io",
                "role": "manager",
                "plan": "pro",
                "is_active": True,
                "mfa_enabled": True,
                "storage_used": 838860800,
                "storage_quota": 21474836480,
                "avatar_color": "#10b981",
            },
            {
                "name": "David Miller",
                "email": "david.m@secureshare.io",
                "role": "editor",
                "plan": "pro",
                "is_active": True,
                "mfa_enabled": False,
                "storage_used": 419430400,
                "storage_quota": 21474836480,
                "avatar_color": "#8b5cf6",
            },
            {
                "name": "Elena Rostova",
                "email": "elena.r@secureshare.io",
                "role": "editor",
                "plan": "free",
                "is_active": True,
                "mfa_enabled": True,
                "storage_used": 104857600,
                "storage_quota": 5368709120,
                "avatar_color": "#f59e0b",
            },
            {
                "name": "James Wilson",
                "email": "j.wilson@secureshare.io",
                "role": "viewer",
                "plan": "free",
                "is_active": True,
                "mfa_enabled": False,
                "storage_used": 52428800,
                "storage_quota": 5368709120,
                "avatar_color": "#ec4899",
            },
            {
                "name": "Priya Sharma",
                "email": "priya.s@secureshare.io",
                "role": "manager",
                "plan": "pro",
                "is_active": True,
                "mfa_enabled": True,
                "storage_used": 524288000,
                "storage_quota": 21474836480,
                "avatar_color": "#06b6d4",
            },
            {
                "name": "Marcus Vance",
                "email": "marcus.vance@secureshare.io",
                "role": "admin",
                "plan": "enterprise",
                "is_active": True,
                "mfa_enabled": True,
                "storage_used": 734003200,
                "storage_quota": 53687091200,
                "avatar_color": "#6366f1",
            },
            {
                "name": "Suspended User",
                "email": "suspended@secureshare.io",
                "role": "viewer",
                "plan": "free",
                "is_active": False,
                "mfa_enabled": False,
                "storage_used": 0,
                "storage_quota": 5368709120,
                "avatar_color": "#64748b",
            },
        ]

        created_users = []
        for u in users_data:
            user = User(
                id=uuid.uuid4(),
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password("Password123!"),
                role=u["role"],
                plan=u["plan"],
                is_active=u["is_active"],
                mfa_enabled=u["mfa_enabled"],
                storage_used=u["storage_used"],
                storage_quota=u["storage_quota"],
                avatar_color=u["avatar_color"],
                created_at=now - timedelta(days=15),
            )
            db.add(user)
            created_users.append(user)

        db.commit()

        # 2. Add Sample Files (for storage breakdown stats)
        sample_files = [
            {"filename": "Q3_Financial_Report.pdf", "mime_type": "application/pdf", "size_bytes": 12500000},
            {"filename": "Architecture_Diagram.png", "mime_type": "image/png", "size_bytes": 8400000},
            {"filename": "Database_Backup_2026.zip", "mime_type": "application/zip", "size_bytes": 1500000000},
            {"filename": "System_Audit_Log.csv", "mime_type": "text/csv", "size_bytes": 3351788},
            {"filename": "Product_Demo_HD.mp4", "mime_type": "video/mp4", "size_bytes": 1080000000},
            {"filename": "Security_Policy_v2.docx", "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "size_bytes": 14000000},
        ]

        admin_user = created_users[0]
        for sf in sample_files:
            file_record = File(
                id=uuid.uuid4(),
                owner_id=admin_user.id,
                filename=sf["filename"],
                mime_type=sf["mime_type"],
                size_bytes=sf["size_bytes"],
                storage_path=f"uploads/{sf['filename']}",
                created_at=now - timedelta(days=3),
            )
            db.add(file_record)

        # 3. Add Sample Audit Logs
        audit_events = [
            {"action": "USER_LOGIN", "target": "Sarah Connor", "level": "info", "result": "Success"},
            {"action": "ROLE_UPDATE", "target": "Alex Mercer (Viewer -> Manager)", "level": "warning", "result": "Success"},
            {"action": "FILE_DELETE", "target": "Confidential_Draft.docx", "level": "warning", "result": "Success"},
            {"action": "MFA_ENABLED", "target": "Priya Sharma", "level": "info", "result": "Success"},
            {"action": "UNAUTHORIZED_ACCESS", "target": "/api/admin/storage", "level": "danger", "result": "Blocked"},
            {"action": "ACCOUNT_SUSPENDED", "target": "Suspended User", "level": "danger", "result": "Success"},
        ]

        for ae in audit_events:
            log = AuditLog(
                id=uuid.uuid4(),
                user_id=admin_user.id,
                admin_name=admin_user.name,
                admin_email=admin_user.email,
                action=ae["action"],
                target=ae["target"],
                level=ae["level"],
                result=ae["result"],
                ip_address="192.168.1.105",
                created_at=now - timedelta(hours=2),
            )
            db.add(log)

        db.commit()
        print("Successfully seeded admin database with realistic sample users, files, and audit logs!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding admin data: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin_data()
