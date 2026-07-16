import pyotp


def _signup(client, email="mfa@x.com"):
    r = client.post("/api/auth/signup", json={"name": "M", "email": email, "password": "pw123456"})
    assert r.status_code == 201, r.text
    return r.json()


def _auth_headers(tokens):
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def test_mfa_full_flow(client):
    tokens = _signup(client)
    setup = client.post("/api/auth/mfa/setup", headers=_auth_headers(tokens))
    assert setup.status_code == 200, setup.text
    secret = setup.json()["secret"]

    good_code = pyotp.TOTP(secret).now()
    enable = client.post("/api/auth/mfa/enable", headers=_auth_headers(tokens), json={"code": good_code})
    assert enable.status_code == 204, enable.text

    # Fresh login should now require MFA (no tokens issued yet)
    login = client.post("/api/auth/login", json={"email": "mfa@x.com", "password": "pw123456"})
    assert login.status_code == 200
    body = login.json()
    assert body.get("mfa_required") is True and "mfa_token" in body

    # Wrong code → 401
    bad = client.post("/api/auth/mfa/verify", json={"mfa_token": body["mfa_token"], "code": "000000"})
    assert bad.status_code == 401

    # Correct code → real tokens
    ok = client.post("/api/auth/mfa/verify",
                     json={"mfa_token": body["mfa_token"], "code": pyotp.TOTP(secret).now()})
    assert ok.status_code == 200
    assert "access_token" in ok.json()


def test_login_without_mfa_still_returns_tokens(client):
    _signup(client, email="nomfa@x.com")
    r = client.post("/api/auth/login", json={"email": "nomfa@x.com", "password": "pw123456"})
    assert r.status_code == 200
    assert "access_token" in r.json()
    assert "mfa_required" not in r.json()
