def test_auth_service_hash():
    from src.auth.dependencies import hash_password, verify_password
    hashed = hash_password('secret')
    assert verify_password('secret', hashed)
    assert not verify_password('wrong_secret', hashed)
