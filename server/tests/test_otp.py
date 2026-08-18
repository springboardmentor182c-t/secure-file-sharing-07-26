from datetime import datetime, timedelta, timezone

from src.auth import otp


def test_generate_otp_format():
    code = otp.generate_otp()

    assert isinstance(code, str)
    assert len(code) == otp.OTP_LENGTH
    assert code.isdigit()


def test_is_otp_expired():
    future = datetime.now(timezone.utc) + timedelta(minutes=10)
    assert not otp.is_otp_expired(future)

    past = datetime.now(timezone.utc) - timedelta(minutes=10)
    assert otp.is_otp_expired(past)
