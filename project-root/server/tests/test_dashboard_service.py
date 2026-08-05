from datetime import datetime, timedelta, timezone

from src.dashboard.service import get_dashboard_data
from src.entities.file import File
from src.entities.notification import Notification
from src.entities.share_link import ShareLink
from src.entities.user import User


def test_dashboard_data_is_aggregated_from_database(db):
    user = User(
        name="Dashboard Test",
        email="dashboard-service@test.com",
        hashed_password="not-used",
        storage_used=1_000_000_000,
        storage_quota=5_000_000_000,
    )
    db.add(user)
    db.flush()

    file = File(
        original_name="report.pdf",
        stored_name="dashboard-test-report.pdf",
        mimetype="application/pdf",
        size=1_000,
        encrypted=True,
        owner_id=user.id,
    )
    db.add(file)
    db.flush()

    db.add(
        ShareLink(
            file_id=file.id,
            token="dashboard-test-share",
            created_by=user.id,
            access_count=3,
            is_active=True,
        )
    )
    db.add(
        Notification(
            user_id=user.id,
            type="upload",
            category="uploads",
            title="Upload complete",
            message="report.pdf is ready.",
            is_read=False,
        )
    )
    db.commit()
    db.refresh(user)

    result = get_dashboard_data(db, user)

    assert result.analytics.total_files == 1
    assert result.analytics.encrypted_files == 1
    assert result.analytics.total_share_links == 1
    assert result.analytics.active_share_links == 1
    assert result.analytics.total_share_views == 3
    assert result.analytics.total_notifications == 1
    assert result.analytics.unread_notifications == 1
    assert result.analytics.storage.percent == 20.0
    assert result.analytics.top_file_types == {"pdf": 1}
    assert result.files[0].original_name == "report.pdf"
    assert result.notifications[0].title == "Upload complete"


def test_dashboard_counts_all_encrypted_files_and_only_usable_share_links(db):
    user = User(
        name="Dashboard Metrics",
        email="dashboard-metrics@test.com",
        hashed_password="not-used",
    )
    db.add(user)
    db.flush()

    files = []
    for index in range(7):
        file = File(
            original_name=f"encrypted-{index}.pdf",
            stored_name=f"dashboard-encrypted-{index}.pdf",
            mimetype="application/pdf",
            size=1_000,
            encrypted=True,
            owner_id=user.id,
        )
        db.add(file)
        files.append(file)

    unencrypted_file = File(
        original_name="plain.txt",
        stored_name="dashboard-plain.txt",
        mimetype="text/plain",
        size=100,
        encrypted=False,
        owner_id=user.id,
    )
    db.add(unencrypted_file)
    db.flush()

    now = datetime.now(timezone.utc)
    db.add_all(
        [
            ShareLink(
                file_id=files[0].id,
                token="dashboard-active-share",
                created_by=user.id,
                access_count=0,
                is_active=True,
            ),
            ShareLink(
                file_id=files[0].id,
                token="dashboard-expired-share",
                created_by=user.id,
                expires_at=now - timedelta(hours=1),
                access_count=0,
                is_active=True,
            ),
            ShareLink(
                file_id=files[0].id,
                token="dashboard-view-limit-share",
                created_by=user.id,
                max_views=2,
                access_count=2,
                is_active=True,
            ),
            ShareLink(
                file_id=files[0].id,
                token="dashboard-revoked-share",
                created_by=user.id,
                access_count=0,
                is_active=False,
            ),
        ]
    )
    db.commit()
    db.refresh(user)

    result = get_dashboard_data(db, user)

    assert result.analytics.total_files == 8
    assert result.analytics.encrypted_files == 7
    assert len(result.files) == 6
    assert result.analytics.total_share_links == 4
    assert result.analytics.active_share_links == 1
