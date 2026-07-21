"""
End-to-end tests for the Files API (My Files screen), run against an
isolated in-memory SQLite database (see conftest.py).
"""
import io


def _create_user(client, email="owner@example.com"):
    resp = client.post("/users", json={"email": email, "full_name": "Test Owner"})
    assert resp.status_code == 201
    user = resp.json()["data"]
    return user, {"X-User-Id": user["id"]}


def _upload(client, headers, filename="report.pdf", content=b"hello world", **extra):
    data = {}
    if "folder_id" in extra and extra["folder_id"] is not None:
        data["folder_id"] = extra["folder_id"]
    if "category" in extra:
        data["category"] = extra["category"]
    resp = client.post(
        "/files", headers=headers, data=data,
        files={"upload": (filename, io.BytesIO(content), "application/octet-stream")},
    )
    return resp


def test_upload_and_get_file(client):
    _, headers = _create_user(client)
    resp = _upload(client, headers, filename="notes.txt", content=b"hello")
    assert resp.status_code == 201
    file_obj = resp.json()["data"]
    assert file_obj["original_filename"] == "notes.txt"
    assert file_obj["extension"] == "txt"
    assert file_obj["size"] == 5
    assert file_obj["encryption_status"] == "aes-256-gcm"
    assert file_obj["is_deleted"] is False
    assert file_obj["is_shared"] is False

    get_resp = client.get(f"/files/{file_obj['id']}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["id"] == file_obj["id"]


def test_upload_rejects_disallowed_extension(client):
    _, headers = _create_user(client)
    resp = _upload(client, headers, filename="virus.exe", content=b"x")
    assert resp.status_code == 415


def test_upload_rejects_empty_file(client):
    _, headers = _create_user(client)
    resp = _upload(client, headers, filename="empty.txt", content=b"")
    assert resp.status_code == 422


def test_duplicate_filename_in_same_folder_is_rejected(client):
    _, headers = _create_user(client)
    assert _upload(client, headers, filename="dup.txt", content=b"one").status_code == 201
    resp = _upload(client, headers, filename="dup.txt", content=b"two")
    assert resp.status_code == 409


def test_duplicate_content_is_rejected(client):
    _, headers = _create_user(client)
    assert _upload(client, headers, filename="a.txt", content=b"same bytes").status_code == 201
    resp = _upload(client, headers, filename="b.txt", content=b"same bytes")
    assert resp.status_code == 409


def test_list_search_and_pagination(client):
    _, headers = _create_user(client)
    _upload(client, headers, filename="alpha.txt", content=b"alpha-content")
    _upload(client, headers, filename="beta.txt", content=b"beta-content")

    list_resp = client.get("/files", headers=headers)
    assert list_resp.status_code == 200
    body = list_resp.json()
    assert body["pagination"]["total_items"] == 2

    search_resp = client.get("/files?search=alpha", headers=headers)
    assert search_resp.json()["pagination"]["total_items"] == 1
    assert search_resp.json()["data"][0]["original_filename"] == "alpha.txt"


def test_rename_move_star_trash_restore_flow(client):
    _, headers = _create_user(client)
    file_obj = _upload(client, headers, filename="doc.txt", content=b"content").json()["data"]
    file_id = file_obj["id"]

    rename_resp = client.patch(f"/files/{file_id}/rename", headers=headers, json={"name": "renamed.txt"})
    assert rename_resp.status_code == 200
    assert rename_resp.json()["data"]["original_filename"] == "renamed.txt"

    star_resp = client.post(f"/files/{file_id}/star", headers=headers)
    assert star_resp.json()["data"]["is_starred"] is True

    folder = client.post("/folders", headers=headers, json={"name": "Work"}).json()["data"]
    move_resp = client.patch(f"/files/{file_id}/move", headers=headers, json={"folder_id": folder["id"]})
    assert move_resp.status_code == 200
    assert move_resp.json()["data"]["folder_id"] == folder["id"]

    del_resp = client.delete(f"/files/{file_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["data"]["is_deleted"] is True

    # Trashed files disappear from the normal listing...
    assert client.get("/files", headers=headers).json()["pagination"]["total_items"] == 0
    # ...but show up in Trash.
    trash_resp = client.get("/files/trash", headers=headers)
    assert trash_resp.json()["pagination"]["total_items"] == 1

    restore_resp = client.post(f"/files/{file_id}/restore", headers=headers)
    assert restore_resp.status_code == 200
    assert restore_resp.json()["data"]["is_deleted"] is False
    assert client.get("/files", headers=headers).json()["pagination"]["total_items"] == 1


def test_download_returns_original_bytes_decrypted(client):
    _, headers = _create_user(client)
    file_obj = _upload(client, headers, filename="secret.txt", content=b"top secret contents").json()["data"]

    dl = client.get(f"/files/{file_obj['id']}/download", headers=headers)
    assert dl.status_code == 200
    assert dl.content == b"top secret contents"

    # download_count should now reflect the download
    detail = client.get(f"/files/{file_obj['id']}", headers=headers).json()["data"]
    assert detail["download_count"] == 1


def test_storage_stats_reflect_uploads(client):
    _, headers = _create_user(client)
    _upload(client, headers, filename="a.txt", content=b"12345")
    _upload(client, headers, filename="b.txt", content=b"1234567890")

    stats = client.get("/files/storage-stats", headers=headers).json()["data"]
    assert stats["used_bytes"] == 15
    assert stats["file_count"] == 2
    assert stats["remaining_bytes"] == stats["total_bytes"] - 15


def test_folder_crud_and_delete_moves_files_to_root(client):
    _, headers = _create_user(client)
    folder = client.post("/folders", headers=headers, json={"name": "Finance"}).json()["data"]

    file_obj = _upload(client, headers, filename="q1.txt", content=b"q1-data", folder_id=folder["id"]).json()["data"]
    assert file_obj["folder_id"] == folder["id"]

    list_resp = client.get("/folders", headers=headers).json()["data"]
    assert any(f["id"] == folder["id"] and f["file_count"] == 1 for f in list_resp)

    del_resp = client.delete(f"/folders/{folder['id']}", headers=headers)
    assert del_resp.status_code == 200

    moved = client.get(f"/files/{file_obj['id']}", headers=headers).json()["data"]
    assert moved["folder_id"] is None


def test_users_cannot_access_each_others_files(client):
    _, owner_headers = _create_user(client, email="owner@example.com")
    _, other_headers = _create_user(client, email="other@example.com")

    file_obj = _upload(client, owner_headers, filename="private.txt", content=b"shh").json()["data"]

    resp = client.get(f"/files/{file_obj['id']}", headers=other_headers)
    assert resp.status_code == 404

    dl = client.get(f"/files/{file_obj['id']}/download", headers=other_headers)
    assert dl.status_code == 404


def test_uploaded_file_can_be_used_to_create_a_shared_link(client):
    """The integration point between My Files and Shared Links: no
    duplicate upload, no duplicate API - the same file_id from POST /files
    is handed straight to POST /shared-links."""
    _, headers = _create_user(client)
    file_obj = _upload(client, headers, filename="deck.pdf", content=b"slides").json()["data"]

    link_resp = client.post(
        "/shared-links", headers=headers,
        json={"file_id": file_obj["id"], "recipient_email": "friend@example.com", "permission": "view"},
    )
    assert link_resp.status_code == 201
    assert link_resp.json()["data"]["file"]["file_name"] == "deck.pdf"

    # The file should now report itself as shared.
    detail = client.get(f"/files/{file_obj['id']}", headers=headers).json()["data"]
    assert detail["is_shared"] is True
