def test_users_endpoints(client):
    # Register user
    signup_payload = {
        "email": "profileuser@example.com",
        "password": "securepassword",
        "full_name": "Profile User"
    }
    signup_res = client.post("/api/users/signup", json=signup_payload)
    assert signup_res.status_code == 201

    # Unauthorized access to /me
    me_res = client.get("/api/users/me")
    assert me_res.status_code == 401

    # Login to get token
    login_payload = {
        "email": "profileuser@example.com",
        "password": "securepassword"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Authorized access to /me
    me_res = client.get("/api/users/me", headers=headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == "profileuser@example.com"
    assert user_data["full_name"] == "Profile User"

    # Update /me
    update_payload = {
        "full_name": "Updated Profile User",
        "bio": "New Bio Description"
    }
    update_res = client.put("/api/users/me", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["full_name"] == "Updated Profile User"
    assert updated_data["bio"] == "New Bio Description"
