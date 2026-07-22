import os

from datetime import (
    datetime,
    timedelta,
    timezone
)

from jose import (
    JWTError,
    jwt
)

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        15
    )
)

REFRESH_TOKEN_EXPIRE_DAYS = 7


# ==========================================
# ACCESS TOKEN
# ==========================================

def create_access_token(
    user_id: str,
    role: str
):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==========================================
# REFRESH TOKEN
# ==========================================

def create_refresh_token(
    user_id: str
):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==========================================
# VERIFY TOKEN
# ==========================================

def verify_token(
    token: str,
    token_type: str
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload["type"] != token_type:
            return None

        return payload

    except JWTError:

        return None


# ==========================================
# EMAIL VERIFICATION TOKEN
# ==========================================

def create_email_verification_token(
    user_id: str
):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(hours=24)
    )

    payload = {
        "sub": user_id,
        "type": "email_verification",
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ==========================================
# VERIFY EMAIL TOKEN
# ==========================================

def verify_email_token(
    token: str
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload["type"] != "email_verification":
            return None

        return payload

    except JWTError:

        return None