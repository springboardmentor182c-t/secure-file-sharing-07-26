import random

from datetime import (
    datetime,
    timedelta,
    timezone
)


OTP_LENGTH = 6

OTP_EXPIRE_MINUTES = 5


def generate_otp() -> str:
    """
    Generate 6-digit OTP.
    """

    return "".join(
        str(random.randint(0, 9))
        for _ in range(OTP_LENGTH)
    )


def get_otp_expiry():

    return (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=OTP_EXPIRE_MINUTES
        )
    )


def is_otp_expired(expires_at):

    return datetime.now(
        timezone.utc
    ) > expires_at.replace(
        tzinfo=timezone.utc
    )