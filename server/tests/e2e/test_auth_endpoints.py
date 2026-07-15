import pytest

def test_login_success_and_failure(client):
    # Register user
    signup_payload = {
        "email": "authuser@example.com",
        "password": "securepassword",
        "full_name": "Auth User"
    }
    signup_res = client.post("/api/users/signup", json=signup_payload)
    assert signup_res.status_code == 201

    # Successful login
    login_payload = {
        "email": "authuser@example.com",
        "password": "securepassword"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # Failed login
    bad_login_payload = {
        "email": "authuser@example.com",
        "password": "wrongpassword"
    }
    bad_login_res = client.post("/api/auth/login", json=bad_login_payload)
    assert bad_login_res.status_code == 401
