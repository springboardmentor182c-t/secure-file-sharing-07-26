def test_auth_service_hash():
    from src.auth.dependencies import hash_password, verify_password
    h = hash_password('secret')
    assert h != 'secret'
    assert verify_password('secret', h)
    assert not verify_password('wrong', h)
