import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app import models, schemas
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_mfa_pending_token,
    generate_raw_token,
    hash_token,
    decode_token,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

REFRESH_COOKIE_NAME = "refresh_token"


def _set_refresh_cookie(response: Response, raw_refresh_token: str):
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path="/api/auth",
    )


def _create_session(db: Session, user: models.User, request: Request) -> str:
    raw_token = generate_raw_token()
    session = models.UserSession(
        user_id=user.id,
        refresh_token_hash=hash_token(raw_token),
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
        expires_at=dt.datetime.utcnow() + dt.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    db.commit()
    return raw_token


# ── Register ─────────────────────────────────────────────────────────────
@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # TODO: send verification email via app.email_utils.send_verification_email
    return user


# ── Login ────────────────────────────────────────────────────────────────
@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()

    # Constant-ish response whether user/password is wrong, to avoid leaking which one failed
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account is disabled")

    if user.mfa_enabled:
        mfa_token = create_mfa_pending_token(user.id)
        return schemas.TokenResponse(access_token="", mfa_required=True, mfa_token=mfa_token)

    access_token = create_access_token(user.id)
    raw_refresh = _create_session(db, user, request)
    _set_refresh_cookie(response, raw_refresh)
    return schemas.TokenResponse(access_token=access_token)


# ── Refresh ──────────────────────────────────────────────────────────────
@router.post("/refresh", response_model=schemas.TokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token provided")

    token_hash = hash_token(raw_token)
    session = db.query(models.UserSession).filter(models.UserSession.refresh_token_hash == token_hash).first()

    if not session or session.is_revoked or session.expires_at < dt.datetime.utcnow():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token invalid or expired")

    user = db.get(models.User, session.user_id)
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")

    # Rotate refresh token (revoke old, issue new) to limit replay window
    session.is_revoked = True
    db.add(session)
    new_raw_refresh = _create_session(db, user, request)
    _set_refresh_cookie(response, new_raw_refresh)

    access_token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=access_token)


# ── Logout ───────────────────────────────────────────────────────────────
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_token:
        token_hash = hash_token(raw_token)
        session = db.query(models.UserSession).filter(models.UserSession.refresh_token_hash == token_hash).first()
        if session:
            session.is_revoked = True
            db.add(session)
            db.commit()
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/api/auth")


# ── Current user ─────────────────────────────────────────────────────────
@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ── Session management ────────────────────────────────────────────────────
@router.get("/sessions", response_model=list[schemas.SessionOut])
def list_sessions(
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_raw = request.cookies.get(REFRESH_COOKIE_NAME)
    current_hash = hash_token(current_raw) if current_raw else None

    sessions = (
        db.query(models.UserSession)
        .filter(models.UserSession.user_id == current_user.id, models.UserSession.is_revoked == False)  # noqa: E712
        .order_by(models.UserSession.last_used_at.desc())
        .all()
    )
    return [
        schemas.SessionOut(
            id=s.id,
            user_agent=s.user_agent,
            ip_address=s.ip_address,
            created_at=s.created_at.isoformat(),
            last_used_at=s.last_used_at.isoformat(),
            is_current=(s.refresh_token_hash == current_hash),
        )
        for s in sessions
    ]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_session(
    session_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = (
        db.query(models.UserSession)
        .filter(models.UserSession.id == session_id, models.UserSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    session.is_revoked = True
    db.add(session)
    db.commit()
