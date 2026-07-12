"""
End-to-end tests for the Shared Links API, run against an isolated
in-memory SQLite database (see conftest.py).
"""
import io


def _create_user(client, email="owner@example.com"):
    resp = client.post("/users", json={"email": email, "full_name": "Test Owner"})
    assert resp.status_code == 201
    return resp.json()["data"]


def _upload_file(client, headers, filename="report.pdf"):
    resp = client.post(
        "/files",
        headers=headers,
        files={"upload": (filename, io.BytesIO(b"dummy file bytes"), "application/pdf")},
    )
    assert resp.status_code == 201
    return resp.json()["data"]


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_create_and_list_shared_link(client, auth_headers):
    _create_user(client)
    file_obj = _upload_file(client, auth_headers)

    create_resp = client.post(
        "/shared-links",
        headers=auth_headers,
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

    list_resp = client.get("/shared-links", headers=auth_headers)
    assert list_resp.status_code == 200
    body = list_resp.json()
    assert body["pagination"]["total_items"] == 1
    assert body["data"][0]["id"] == link["id"]


def test_password_protected_link_access_flow(client, auth_headers):
    _create_user(client)
    file_obj = _upload_file(client, auth_headers)

    create_resp = client.post(
        "/shared-links",
        headers=auth_headers,
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

    get_resp = client.get(f"/shared-links/{link_id}", headers=auth_headers)
    assert get_resp.json()["data"]["views"] == 1

    dl = client.post(f"/share/{link_id}/download", json={"password": "correct-horse"})
    assert dl.status_code == 200
    assert dl.json()["data"]["downloads"] == 1


def test_view_only_link_cannot_be_downloaded(client, auth_headers):
    _create_user(client)
    file_obj = _upload_file(client, auth_headers)

    create_resp = client.post(
        "/shared-links",
        headers=auth_headers,
        json={"file_id": file_obj["id"], "recipient_email": "friend@example.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    dl = client.post(f"/share/{link_id}/download", json={})
    assert dl.status_code == 403
    assert dl.json()["error_code"] == "download_not_allowed"


def test_disable_then_reenable_link(client, auth_headers):
    _create_user(client)
    file_obj = _upload_file(client, auth_headers)
    create_resp = client.post(
        "/shared-links",
        headers=auth_headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    toggle1 = client.post(f"/shared-links/{link_id}/toggle", headers=auth_headers)
    assert toggle1.json()["data"]["status"] == "disabled"

    blocked = client.post(f"/share/{link_id}/access", json={})
    assert blocked.status_code == 410
    assert blocked.json()["error_code"] == "link_unavailable"

    toggle2 = client.post(f"/shared-links/{link_id}/toggle", headers=auth_headers)
    assert toggle2.json()["data"]["status"] == "active"


def test_revoke_is_terminal(client, auth_headers):
    _create_user(client)
    file_obj = _upload_file(client, auth_headers)
    create_resp = client.post(
        "/shared-links",
        headers=auth_headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    revoke_resp = client.post(f"/shared-links/{link_id}/revoke", headers=auth_headers)
    assert revoke_resp.json()["data"]["status"] == "revoked"

    blocked = client.post(f"/share/{link_id}/access", json={})
    assert blocked.status_code == 410
    assert blocked.json()["error_code"] == "link_unavailable"


def test_delete_link(client, auth_headers):
    _create_user(client)
    file_obj = _upload_file(client, auth_headers)
    create_resp = client.post(
        "/shared-links",
        headers=auth_headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_id = create_resp.json()["data"]["id"]

    del_resp = client.delete(f"/shared-links/{link_id}", headers=auth_headers)
    assert del_resp.status_code == 200

    get_resp = client.get(f"/shared-links/{link_id}", headers=auth_headers)
    assert get_resp.status_code == 404
    assert get_resp.json()["error_code"] == "not_found"


def test_search_and_filter(client, auth_headers):
    _create_user(client)
    file_a = _upload_file(client, auth_headers, filename="alpha-report.pdf")
    file_b = _upload_file(client, auth_headers, filename="beta-notes.docx")

    client.post(
        "/shared-links",
        headers=auth_headers,
        json={"file_id": file_a["id"], "recipient_email": "a@b.com", "permission": "view"},
    )
    link_b = client.post(
        "/shared-links",
        headers=auth_headers,
        json={"file_id": file_b["id"], "recipient_email": "b@b.com", "permission": "download", "allow_download": True},
    ).json()["data"]

    search_resp = client.get("/shared-links?search=alpha", headers=auth_headers)
    assert search_resp.json()["pagination"]["total_items"] == 1
    assert search_resp.json()["data"][0]["file"]["file_name"] == "alpha-report.pdf"

    client.post(f"/shared-links/{link_b['id']}/revoke", headers=auth_headers)
    status_resp = client.get("/shared-links?status=revoked", headers=auth_headers)
    assert status_resp.json()["pagination"]["total_items"] == 1


def test_analytics_overview_reflects_activity(client, auth_headers):
    _create_user(client)
    file_obj = _upload_file(client, auth_headers)
    create_resp = client.post(
        "/shared-links",
        headers=auth_headers,
        json={"file_id": file_obj["id"], "recipient_email": "a@b.com", "permission": "download", "allow_download": True},
    )
    link_id = create_resp.json()["data"]["id"]

    client.post(f"/share/{link_id}/access", json={})
    client.post(f"/share/{link_id}/download", json={})

    overview = client.get("/analytics/overview", headers=auth_headers)
    data = overview.json()["data"]
    assert data["stats"]["active_links"] == 1
    assert data["stats"]["total_views"] == 1
    assert data["stats"]["total_downloads"] == 1
    assert len(data["recent_activity"]) == 2


def test_cannot_create_link_for_someone_elses_file(client, owner_id):
    owner_headers = {"X-User-Id": owner_id}
    other_headers = {"X-User-Id": "22222222-2222-2222-2222-222222222222"}

    _create_user(client, email="owner@example.com")
    _create_user(client, email="other@example.com")
    file_obj = _upload_file(client, owner_headers)

    resp = client.post(
        "/shared-links",
        headers=other_headers,
        json={"file_id": file_obj["id"], "recipient_email": "x@y.com", "permission": "view"},
    )
    assert resp.status_code == 403
    assert resp.json()["error_code"] == "permission_denied"
