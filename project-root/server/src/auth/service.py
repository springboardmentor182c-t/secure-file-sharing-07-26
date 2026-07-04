from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.entities.user import User
from src.auth.models import SignupRequest, TokenResponse, UserOut
from src.auth.dependencies import hash_password, verify_password, create_access_token, create_refresh_token


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


def _build_token_response(user: User) -> TokenResponse:
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )
