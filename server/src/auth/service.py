import secrets
import pyotp
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.entities.user import User
from src.auth.models import SignupRequest, TokenResponse, UserOut
from src.auth.dependencies import hash_password, verify_password, create_access_token, create_refresh_token

MFA_ISSUER = "TrustShare"


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def register_user(db: Session, data: SignupRequest) -> TokenResponse:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # First user becomes admin
    is_first = db.query(User).count() == 0

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role="admin" if is_first else "member",
        plan="enterprise" if is_first else "free",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _build_token_response(user)


def get_or_create_oauth_user(db: Session, email: str, name: str) -> User:
    """Find a user by email, or create one for a first-time social login."""
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user

    # First user in the system becomes the admin (matches signup behavior)
    is_first = db.query(User).count() == 0

    user = User(
        name=name or email.split("@")[0],
        email=email,
        # OAuth users have no password; store an unusable random hash to satisfy NOT NULL
        hashed_password=hash_password(secrets.token_urlsafe(32)),
        role="admin" if is_first else "member",
        plan="enterprise" if is_first else "free",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def provision_mfa_secret(user: User, db: Session) -> tuple[str, str]:
    """Generate (and persist) a fresh MFA secret. Returns (secret, otpauth_uri).
    Secret is only committed to the DB after user calls /mfa/enable with a valid code."""
    secret = pyotp.random_base32()
    user.mfa_secret = secret
    db.commit()
    uri = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=MFA_ISSUER)
    return secret, uri


def verify_mfa_code(user: User, code: str) -> bool:
    if not user.mfa_secret or not code:
        return False
    # valid_window=1 tolerates ±30s clock skew — one step on either side.
    return pyotp.TOTP(user.mfa_secret).verify(code, valid_window=1)


def _build_token_response(user: User) -> TokenResponse:
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )
