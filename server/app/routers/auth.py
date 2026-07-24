"""
Authentication endpoints: register, login, MFA, current user, logout,
forgot / reset password.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models import PasswordResetToken, User
from app.schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    MFAEnableRequest,
    MFASetupResponse,
    MFAVerifyRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserOut,
)
from app.security import (
    create_access_token,
    create_mfa_token,
    create_refresh_token,
    decode_token_of_type,
    generate_totp_secret,
    generate_url_safe_token,
    hash_password,
    totp_provisioning_uri,
    verify_password,
    verify_totp_code,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])


# ── Register ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── Login ────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    if user.mfa_enabled:
        return LoginResponse(mfa_required=True, mfa_token=create_mfa_token(user.id))

    return LoginResponse(
        mfa_required=False,
        token=Token(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id)),
        user=UserOut.model_validate(user),
    )


# ── MFA verify (completes login) ─────────────────────────────────────────────
@router.post("/mfa/verify", response_model=LoginResponse)
def mfa_verify(payload: MFAVerifyRequest, db: Session = Depends(get_db)):
    claims = decode_token_of_type(payload.mfa_token, expected_type="mfa_pending")
    if claims is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="MFA session expired, please sign in again")

    user = db.query(User).filter(User.id == claims["sub"]).first()
    if not user or not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA is not enabled for this account")

    if not verify_totp_code(user.mfa_secret, payload.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication code")

    return LoginResponse(
        mfa_required=False,
        token=Token(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id)),
        user=UserOut.model_validate(user),
    )


# ── MFA setup / enable (for an already authenticated user) ──────────────────
@router.post("/mfa/setup", response_model=MFASetupResponse)
def mfa_setup(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    secret = generate_totp_secret()
    current_user.mfa_secret = secret
    current_user.mfa_enabled = False  # not enabled until confirmed via /mfa/enable
    db.commit()
    return MFASetupResponse(secret=secret, otpauth_url=totp_provisioning_uri(secret, current_user.email))


@router.post("/mfa/enable", response_model=MessageResponse)
def mfa_enable(
    payload: MFAEnableRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not current_user.mfa_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Call /auth/mfa/setup first")
    if not verify_totp_code(current_user.mfa_secret, payload.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication code")

    current_user.mfa_enabled = True
    db.commit()
    return MessageResponse(message="MFA has been enabled for your account")


@router.post("/mfa/disable", response_model=MessageResponse)
def mfa_disable(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    db.commit()
    return MessageResponse(message="MFA has been disabled for your account")


# ── Current user ──────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


# ── Logout ────────────────────────────────────────────────────────────────────
@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_active_user)):
    # JWT access tokens are stateless, so logout is primarily a client-side
    # action (discard the stored token). This endpoint exists so the client
    # has a single place to call, and so a token-blacklist table could be
    # added here later without changing the frontend contract.
    return MessageResponse(message="Logged out successfully")


# ── Forgot / reset password ──────────────────────────────────────────────────
@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return the same message whether or not the account exists, to
    # avoid leaking which emails are registered.
    generic_message = "If an account with that email exists, a reset link has been sent."

    if not user:
        return ForgotPasswordResponse(message=generic_message)

    raw_token = generate_url_safe_token()
    reset_row = PasswordResetToken(
        user_id=user.id,
        token=raw_token,
        expires_at=PasswordResetToken.default_expiry(minutes=15),
    )
    db.add(reset_row)
    db.commit()

    # TODO: send `raw_token` via a real transactional email provider.
    # In development we hand it back directly so the flow can be tested
    # without an email service configured.
    return ForgotPasswordResponse(
        message=generic_message,
        reset_token=raw_token if settings.ENVIRONMENT != "production" else None,
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_row = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token == payload.token, PasswordResetToken.used.is_(False))
        .first()
    )
    if not reset_row or reset_row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == reset_row.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user.hashed_password = hash_password(payload.new_password)
    reset_row.used = True
    db.commit()
    return MessageResponse(message="Password has been reset successfully")

@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session =Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    current_user.hashed_password = hash_password(payload.new_password)

    db.commit()

    return MessageResponse(
        message="Password updated successfully"
    )