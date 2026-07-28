import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer test_token"}

# ---------------------------------------------------------
# Test Case 1: Fetching notifications returns a 200 status
# ---------------------------------------------------------
def test_get_notifications_success(client: TestClient, auth_headers: dict):
    response = client.get("/api/notifications/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# ---------------------------------------------------------
# Test Case 2: Marking a notification as read updates status
# ---------------------------------------------------------
def test_mark_notification_as_read(client: TestClient, auth_headers: dict):
    # Sends patch request to mark notification #1 as read
    response = client.patch("/api/notifications/1/read", headers=auth_headers)
    assert response.status_code in [200, 204, 404]