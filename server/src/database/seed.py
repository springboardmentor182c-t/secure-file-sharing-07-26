"""
Seed script — populates dummy users, files, and shared links so the API
(and the frontend it feeds) has something to look at immediately.

Usage:
    python -m src.database.seed
"""
import os
import uuid
from datetime import datetime, timedelta

from src.database.core import SessionLocal, create_all_tables
from src.entities.file import File
from src.entities.shared_link import SharedLink
from src.entities.user import User
from src.shared_links.constants import LinkPermission, LinkStatus
from src.shared_links.utils import hash_password

# Matches DEV_FALLBACK_USER_ID in src.shared_links.dependencies, so requests
# made without an X-User-Id header (when AUTH_DEV_FALLBACK=true) see this data.
PRIMARY_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


def seed() -> None:
    create_all_tables()
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    db = SessionLocal()
    try:
        user = User(id=PRIMARY_USER_ID, email="alex.chen@trustshare.example.com", full_name="Alex Chen")
        db.add(user)
        db.flush()

        files_data = [
            ("Q4-Financial-Report.pdf", "pdf"),
            ("Design-Assets-2024.zip", "zip"),
            ("Product-Roadmap-2024.docx", "doc"),
            ("Legal-Contracts-2024.pdf", "pdf"),
        ]
        files = []
        for name, ftype in files_data:
            path = os.path.join(UPLOAD_DIR, f"seed_{uuid.uuid4()}_{name}")
            with open(path, "w") as f:
                f.write(f"Dummy content for {name}\n")
            file_obj = File(
                owner_id=user.id, file_name=name, file_type=ftype, storage_path=path,
                size_bytes=os.path.getsize(path), content_type="application/octet-stream",
            )
            db.add(file_obj)
            files.append(file_obj)
        db.flush()

        links_data = [
            (files[0], LinkPermission.VIEW, LinkStatus.ACTIVE, -18, True, False, "finance-team@company.com"),
            (files[1], LinkPermission.DOWNLOAD, LinkStatus.ACTIVE, None, False, True, "design-crew@company.com"),
            (files[2], LinkPermission.VIEW, LinkStatus.ACTIVE, -14, True, False, "product-leads@company.com"),
            (files[3], LinkPermission.VIEW, LinkStatus.REVOKED, 30, True, False, "legal@company.com"),
        ]
        for file_obj, permission, status, expiry_days, has_password, allow_download, recipient in links_data:
            expires_at = datetime.utcnow() + timedelta(days=expiry_days) if expiry_days is not None else None
            link = SharedLink(
                id=uuid.uuid4(), owner_id=user.id, file_id=file_obj.id, permission=permission, status=status,
                password_hash=hash_password("demo1234") if has_password else None,
                password_protected=has_password, allow_download=allow_download,
                recipient_email=recipient, expires_at=expires_at,
            )
            db.add(link)

        db.commit()
        print("Seed complete:")
        print(f"  1 user   -> {PRIMARY_USER_ID}")
        print(f"  {len(files)} files")
        print(f"  {len(links_data)} shared links")
        print("Query the API with header:  X-User-Id: 00000000-0000-0000-0000-000000000001")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
