def _get_auth_headers(client):
    """Helper: register a user and return auth headers."""
    client.post("/api/users/signup", json={
        "email": "todouser@example.com",
        "password": "securepassword",
        "full_name": "Todo User"
    })
    login_res = client.post("/api/auth/login", json={
        "email": "todouser@example.com",
        "password": "securepassword"
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_todos_crud_endpoints(client):
    headers = _get_auth_headers(client)

    # Unauthorized todo fetch
    res = client.get("/api/todos")
    assert res.status_code == 401

    # Create a todo
    create_res = client.post("/api/todos", json={
        "title": "Write unit tests",
        "description": "Cover all modules",
        "priority": "high",
        "completed": False,
        "due_date": "2026-12-31"
    }, headers=headers)
    assert create_res.status_code == 201
    todo = create_res.json()
    assert todo["title"] == "Write unit tests"
    assert todo["priority"] == "high"
    todo_id = todo["id"]

    # List todos
    list_res = client.get("/api/todos", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # Get single todo
    get_res = client.get(f"/api/todos/{todo_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == todo_id

    # Update todo (mark completed)
    update_res = client.put(f"/api/todos/{todo_id}", json={
        "completed": True,
        "title": "Write unit tests (done)"
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["completed"] is True
    assert update_res.json()["title"] == "Write unit tests (done)"

    # Delete todo
    del_res = client.delete(f"/api/todos/{todo_id}", headers=headers)
    assert del_res.status_code == 204

    # Confirm it's gone
    gone_res = client.get(f"/api/todos/{todo_id}", headers=headers)
    assert gone_res.status_code == 404
