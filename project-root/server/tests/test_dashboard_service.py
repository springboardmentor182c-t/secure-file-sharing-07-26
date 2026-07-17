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
    assert result.analytics.total_share_links == 1
    assert result.analytics.active_share_links == 1
    assert result.analytics.total_share_views == 3
    assert result.analytics.total_notifications == 1
    assert result.analytics.unread_notifications == 1
    assert result.analytics.storage.percent == 20.0
    assert result.analytics.top_file_types == {"pdf": 1}
    assert result.files[0].original_name == "report.pdf"
    assert result.notifications[0].title == "Upload complete"
