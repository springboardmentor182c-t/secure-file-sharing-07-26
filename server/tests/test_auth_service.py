from src.auth.service import get_password_hash, verify_password

def test_password_hashing():
    pw = "mysecret123"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False
