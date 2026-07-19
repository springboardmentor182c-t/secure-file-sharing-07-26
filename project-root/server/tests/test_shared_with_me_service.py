import pytest
from fastapi import HTTPException

from src.entities.file import File
from src.entities.file_permission import FilePermission
from src.entities.user import User
from src.shared_with_me.service import get_downloadable_shared_file, list_shared_files


def _user(db, name, email):
    user = User(name=name, email=email, hashed_password="not-used")
    db.add(user)
    db.flush()
    return user


def test_list_shared_files_returns_permission_and_owner_details(db):
    owner = _user(db, "Priya Sharma", "priya@example.com")
    recipient = _user(db, "Alex Morgan", "alex@example.com")
    file = File(original_name="Q3 Product Roadmap.pdf", stored_name="shared-roadmap.pdf", mimetype="application/pdf", size=2_400_000, encrypted=True, owner_id=owner.id)
    db.add(file)
    db.flush()
    db.add(FilePermission(file_id=file.id, user_id=recipient.id, granted_by=owner.id, permission_level="download"))
    db.commit()
    result = list_shared_files(db, recipient.id)
    assert result.total == 1
    assert result.downloadable == 1
    assert result.files[0].name == "Q3 Product Roadmap.pdf"
    assert result.files[0].shared_by == "Priya Sharma"
    assert result.files[0].can_download is True


def test_view_only_shared_file_cannot_be_downloaded(db):
    owner = _user(db, "Owner", "shared-owner@example.com")
    recipient = _user(db, "Recipient", "shared-recipient@example.com")
    file = File(original_name="read-only.txt", stored_name="shared-read-only.txt", mimetype="text/plain", size=20, encrypted=True, owner_id=owner.id)
    db.add(file)
    db.flush()
    db.add(FilePermission(file_id=file.id, user_id=recipient.id, granted_by=owner.id, permission_level="view"))
    db.commit()
    with pytest.raises(HTTPException) as exc:
        get_downloadable_shared_file(db, file.id, recipient.id)
    assert exc.value.status_code == 403
