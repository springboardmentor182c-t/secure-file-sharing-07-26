import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.auth import models, service
from src.auth.dependencies import get_current_user, decode_token, create_access_token, create_refresh_token
from src.entities.user import User

router = APIRouter()


@router.post("/login", response_model=models.TokenResponse)
def login(credentials: models.LoginRequest, db: Session = Depends(get_db)):
    user = service.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
    return service._build_token_response(user)


@router.post("/signup", response_model=models.TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(data: models.SignupRequest, db: Session = Depends(get_db)):
    return service.register_user(db, data)


@router.get("/me", response_model=models.UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=models.TokenResponse)
def refresh(body: models.RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return service._build_token_response(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT — client just discards tokens
    # Future: add token blocklist (Redis)
    return None
