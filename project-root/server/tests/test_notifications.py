from src.auth.dependencies import get_current_user
from src.entities.notification import Notification
from src.entities.user import User
from src.notifications import service


def _user(db, email):
    user = User(name=email.split("@")[0], email=email, hashed_password="not-used")
    db.add(user)
    db.flush()
    return user


def _notification(db, user, title, is_read=False):
    notification = Notification(
        user_id=user.id,
        type="share",
        category="shares",
        title=title,
        message=f"{title} message",
        icon="share",
        is_read=is_read,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def test_notification_service_is_scoped_to_current_user(db):
    owner = _user(db, "notification-owner@example.com")
    other = _user(db, "notification-other@example.com")
    own_notification = _notification(db, owner, "Visible")
    _notification(db, other, "Private")

    result = service.get_user_notifications(db, owner.id)

    assert [item.id for item in result] == [own_notification.id]


def test_authenticated_notification_crud_is_user_scoped(client, db):
    current_user = _user(db, "notification-api@example.com")
    another_user = _user(db, "notification-api-other@example.com")
    own_unread = _notification(db, current_user, "Own unread")
    own_read = _notification(db, current_user, "Own read", is_read=True)
    foreign = _notification(db, another_user, "Someone else's")
    client.app.dependency_overrides[get_current_user] = lambda: current_user

    listed = client.get("/api/notifications/")
    assert listed.status_code == 200
    assert {item["id"] for item in listed.json()} == {own_unread.id, own_read.id}

    marked = client.patch(f"/api/notifications/{own_unread.id}/read")
    assert marked.status_code == 200
    assert marked.json()["is_read"] is True

    assert client.patch(f"/api/notifications/{foreign.id}/read").status_code == 404
    assert client.delete(f"/api/notifications/{foreign.id}").status_code == 404

    removed = client.delete(f"/api/notifications/{own_read.id}")
    assert removed.status_code == 204
    assert db.get(Notification, own_read.id) is None


def test_mark_all_read_only_updates_current_user(client, db):
    current_user = _user(db, "notification-all@example.com")
    another_user = _user(db, "notification-all-other@example.com")
    first = _notification(db, current_user, "First")
    second = _notification(db, current_user, "Second")
    foreign = _notification(db, another_user, "Foreign")
    client.app.dependency_overrides[get_current_user] = lambda: current_user

    response = client.patch("/api/notifications/read-all")

    assert response.status_code == 200
    assert response.json() == {"updated": 2}
    db.expire_all()
    assert db.get(Notification, first.id).is_read is True
    assert db.get(Notification, second.id).is_read is True
    assert db.get(Notification, foreign.id).is_read is False


def test_notifications_require_authentication(client):
    response = client.get("/api/notifications/")
    assert response.status_code == 401
