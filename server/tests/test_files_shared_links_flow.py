def test_upload_and_shared_link_flow(client):
    create_user_res = client.post(
        "/users",
        json={"email": "flow-user@example.com", "full_name": "Flow User"},
    )
    assert create_user_res.status_code == 201
    user_id = create_user_res.json()["data"]["id"]

    upload_res = client.post(
        "/files",
        headers={"X-User-Id": user_id},
        files={"upload": ("notes.txt", b"hello world", "text/plain")},
    )
    assert upload_res.status_code == 201, upload_res.text
    file_id = upload_res.json()["data"]["id"]

    list_files_res = client.get("/files", headers={"X-User-Id": user_id})
    assert list_files_res.status_code == 200, list_files_res.text
    listed_files = list_files_res.json()["data"]
    assert any(item["id"] == file_id for item in listed_files)

    create_link_res = client.post(
        "/shared-links",
        headers={"X-User-Id": user_id},
        json={
            "file_id": file_id,
            "recipient_email": "recipient@example.com",
            "permission": "view",
        },
    )
    assert create_link_res.status_code == 201, create_link_res.text
    shared_link_id = create_link_res.json()["data"]["id"]

    list_links_res = client.get("/shared-links", headers={"X-User-Id": user_id})
    assert list_links_res.status_code == 200, list_links_res.text
    listed_links = list_links_res.json()["data"]
    assert any(item["id"] == shared_link_id for item in listed_links)

    stats_res = client.get("/analytics/stats", headers={"X-User-Id": user_id})
    assert stats_res.status_code == 200, stats_res.text
    assert stats_res.json()["data"]["active_links"] >= 1
