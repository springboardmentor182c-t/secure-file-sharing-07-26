def test_auth_service_hash():
    from src.auth.service import hash_password
    assert hash_password('secret') == hash_password('secret')
    assert hash_password('a') != hash_password('b')
