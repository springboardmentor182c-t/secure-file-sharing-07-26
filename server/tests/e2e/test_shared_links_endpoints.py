"""
End-to-end tests for the Shared Links API, run against an isolated
in-memory SQLite database (see conftest.py).
"""
import io


def _create_user(client, email="owner@example.com"):
    """Creates a REAL user row and returns (user_dict, headers). Tests use
    that real id as X-User-Id rather than a fixed/fake one, since the API
    now genuinely validates the header names an existing user (see
    src/dependencies.py and files/service.py's quota check)."""
    resp = client.post("/users", json={"email": email, "full_name": "Test Owner"})
    assert resp.status_code == 201
    user = resp.json()["data"]
    return user, {"X-User-Id": user["id"]}


def _upload_file(client, headers, filename="report.pdf"):
    resp = client.post(
        "/files",
        headers=headers,
        files={"upload": (filename, io.BytesIO(f"dummy file bytes for {filename}".encode()), "application/pdf")},
    )
    assert resp.status_code == 201
    return resp.json()["data"]


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_create_and_list_shared_link(client):
    _, headers = _create_user(client)
    file_obj = _upload_file(client, headers)

    create_resp = client.post(
        "/shared-links",
        headers=headers,
        json={
            "file_id": file_obj["id"],
            "recipient_email": "friend@example.com",
            "permission": "view",
            "allow_download": False,
        },
    )
    assert create_resp.status_code == 201
    link = create_resp.json()["data"]
    assert link["status"] == "active"
    assert link["views"] == 0
    assert link["share_url"].endswith(link["id"])

    list_resp = client.get("/shared-links", headers=headers)
    assert list_resp.status_code == 200
    body = list_resp.json()
    assert body["pagination"]["total_items"] == 1
    assert body["data"][0]["id"] == link["id"]


def test_password_protected_link_access_flow(client):
    _, headers = _create_user(client)
    file_obj = _upload_file(client, headers)

    create_resp = client.post(
        "/shared-links",
        headers=headers,
        json={
            "file_id": file_obj["id"],
            "recipient_email": "friend@example.com",
            "permission": "download",
            "allow_download": True,
            "password": "correct-horse",
        },
    )
    link_id = create_resp.json()["data"]["id"]

    no_pw = client.post(f"/share/{link_id}/access", json={})
    assert no_pw.status_code == 401
    assert no_pw.json()["error_code"] == "password_required"

    wrong_pw = client.post(f"/share/{link_id}/access", json={"password": "nope"})
    assert wrong_pw.status_code == 401
    assert wrong_pw.json()["error_code"] == "invalid_password"

    ok = client.post(f"/share/{link_id}/access", json={"password": "correct-horse"})
    assert ok.status_code == 200

    get_resp = client.get(f"/shared-links/{link_id}", headers=headers)
    assert get_resp.json()["data"]["views"] == 1

    dl = client.post(f"/share/{link_id}/download", json={"password": "correct-horse"})
    assert dl.status_code == 200
    assert dl.json()["data"]["downloads"] == 1


def test_view_only_link_cannot_be_downloaded(client):
    _, headers = _create_user(client)
    file_obj = _upload_file(client, headers)

    create_resp = client.post(
        "/shared-links",
        headers=headers,
        json={"file_id": file_obj["id"], "recipient_email": "friend@example.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    dl = client.post(f"/share/{link_id}/download", json={})
    assert dl.status_code == 403
    assert dl.json()["error_code"] == "download_not_allowed"


def test_disable_then_reenable_link(client):
    _, headers = _create_user(client)
    file_obj = _upload_file(client, headers)
    create_resp = client.post(
        "/shared-links",
        headers=headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    toggle1 = client.post(f"/shared-links/{link_id}/toggle", headers=headers)
    assert toggle1.json()["data"]["status"] == "disabled"

    blocked = client.post(f"/share/{link_id}/access", json={})
    assert blocked.status_code == 410
    assert blocked.json()["error_code"] == "link_unavailable"

    toggle2 = client.post(f"/shared-links/{link_id}/toggle", headers=headers)
    assert toggle2.json()["data"]["status"] == "active"


def test_revoke_is_terminal(client):
    _, headers = _create_user(client)
    file_obj = _upload_file(client, headers)
    create_resp = client.post(
        "/shared-links",
        headers=headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    revoke_resp = client.post(f"/shared-links/{link_id}/revoke", headers=headers)
    assert revoke_resp.json()["data"]["status"] == "revoked"

    blocked = client.post(f"/share/{link_id}/access", json={})
    assert blocked.status_code == 410
    assert blocked.json()["error_code"] == "link_unavailable"


def test_delete_link(client):
    _, headers = _create_user(client)
    file_obj = _upload_file(client, headers)
    create_resp = client.post(
        "/shared-links",
        headers=headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    del_resp = client.delete(f"/shared-links/{link_id}", headers=headers)
    assert del_resp.status_code == 200

    get_resp = client.get(f"/shared-links/{link_id}", headers=headers)
    assert get_resp.status_code == 404
    assert get_resp.json()["error_code"] == "not_found"


def test_search_and_filter(client):
    _, headers = _create_user(client)
    file_a = _upload_file(client, headers, filename="alpha-report.pdf")
    file_b = _upload_file(client, headers, filename="beta-notes.docx")

    client.post(
        "/shared-links",
        headers=headers,
        json={"file_id": file_a["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_b = client.post(
        "/shared-links",
        headers=headers,
        json={"file_id": file_b["id"], "recipient_email": "b@b.com", "permission": "download", "allow_download": True},
    ).json()["data"]

    search_resp = client.get("/shared-links?search=alpha", headers=headers)
    assert search_resp.json()["pagination"]["total_items"] == 1
    assert search_resp.json()["data"][0]["file"]["file_name"] == "alpha-report.pdf"

    client.post(f"/shared-links/{link_b['id']}/revoke", headers=headers)
    status_resp = client.get("/shared-links?status=revoked", headers=headers)
    assert status_resp.json()["pagination"]["total_items"] == 1


def test_analytics_overview_reflects_activity(client):
    _, headers = _create_user(client)
    file_obj = _upload_file(client, headers)
    create_resp = client.post(
        "/shared-links",
        headers=headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "download", "allow_download": True},
    )
    link_id = create_resp.json()["data"]["id"]

    client.post(f"/share/{link_id}/access", json={})
    client.post(f"/share/{link_id}/download", json={})

    overview = client.get("/analytics/overview", headers=headers)
    data = overview.json()["data"]
    assert data["stats"]["active_links"] == 1
    assert data["stats"]["total_views"] == 1
    assert data["stats"]["total_downloads"] == 1
    assert len(data["recent_activity"]) == 2


def test_cannot_create_link_for_someone_elses_file(client):
    _, owner_headers = _create_user(client, email="owner@example.com")
    _, other_headers = _create_user(client, email="other@example.com")
    file_obj = _upload_file(client, owner_headers)

    resp = client.post(
        "/shared-links",
        headers=other_headers,
        json={"file_id": file_obj["id"], "recipient_email": "x@y.com", "permission": "view"},
    )
    assert resp.status_code == 403
    assert resp.json()["error_code"] == "permission_denied"
