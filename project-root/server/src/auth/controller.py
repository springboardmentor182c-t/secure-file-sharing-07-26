from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.auth import models, service
from src.auth.dependencies import (
    get_current_user,
    decode_token,
    create_access_token,
    create_refresh_token,
)
from src.entities.user import User
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm

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
    
    # Check if MFA is enabled
    if user.mfa_enabled:
        return service.build_mfa_pending_response(user)
        

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended"
        )
    return service._build_token_response(user)


@router.post("/login/swagger", response_model=models.TokenResponse)
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = service.authenticate_user(
        db,
        form_data.username,  # username field carries the email
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )

    return service._build_token_response(user)


@router.post(
    "/signup", response_model=models.TokenResponse, status_code=status.HTTP_201_CREATED
)
def signup(data: models.SignupRequest, db: Session = Depends(get_db)):
    return service.register_user(db, data)


@router.get("/me", response_model=models.UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=models.TokenResponse)
def refresh(body: models.RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return service._build_token_response(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT — client just discards tokens
    return None


# ── MFA Endpoints ──────────────────────────────────────────────────────────

@router.post("/verify-otp", response_model=models.TokenResponse)
def verify_otp(body: models.VerifyOTPRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.mfa_token)
    if payload.get("type") != "mfa_pending":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA session token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    if not service.verify_otp_code(user.id, body.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP code")

    return service._build_token_response(user)


@router.post("/resend-otp")
def resend_otp(body: models.ResendOTPRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.mfa_token)
    if payload.get("type") != "mfa_pending":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA session token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    service.generate_otp(user.id, to_email=user.email, user_name=user.name)
    return {"status": "success", "message": "OTP resent to your registered email"}


# ── Password Recovery Endpoints ────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(body: models.ForgotPasswordRequest, db: Session = Depends(get_db)):
    service.request_password_reset(db, body.email)
    return {"status": "success", "message": "Password reset link generated if email exists"}


@router.post("/reset-password")
def reset_password(body: models.ResetPasswordRequest, db: Session = Depends(get_db)):
    service.reset_password_in_db(db, body.token, body.new_password)
    return {"status": "success", "message": "Password reset successfully"}


# ── Real OAuth2 Endpoints ─────────────────────────────────────────────────────

import os
from src.auth.oauth_config import (
    make_google_client, make_microsoft_client,
    GOOGLE_AUTHORIZE_URL, GOOGLE_TOKEN_URL, GOOGLE_USERINFO_URL, GOOGLE_REDIRECT_URI,
    get_ms_authorize_url, get_ms_token_url, MICROSOFT_USERINFO_URL, MICROSOFT_REDIRECT_URI,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ── Google OAuth2 ──────────────────────────────────────────────────────────────

@router.get("/oauth/google")
async def google_login():
    """Step 1: Redirect the user to Google's consent screen."""
    client = make_google_client()
    # Generate the authorization URL with a random state for CSRF protection
    uri, state = client.create_authorization_url(GOOGLE_AUTHORIZE_URL)
    return RedirectResponse(url=uri)


@router.get("/oauth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Step 2: Google redirects here with an authorization code.
    We exchange it for tokens, fetch the user's profile, and issue a JWT."""
    client = make_google_client()

    # Exchange the authorization code for an access token
    token = await client.fetch_token(
        GOOGLE_TOKEN_URL,
        code=code,
        redirect_uri=GOOGLE_REDIRECT_URI,
    )

    # Fetch the user's profile from Google
    resp = await client.get(GOOGLE_USERINFO_URL)
    profile = resp.json()

    google_email = profile.get("email")
    google_name = profile.get("name", google_email)

    if not google_email:
        raise HTTPException(status_code=400, detail="Google did not return an email address")

    # Create or retrieve the user in our database
    user = service.get_or_create_oauth_user(db, "google", google_email, google_name)

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")

    # Issue our own JWT and redirect the frontend to handle it
    token_resp = service._build_token_response(user)
    redirect_url = (
        f"{FRONTEND_URL}/oauth-callback"
        f"?access_token={token_resp.access_token}"
        f"&refresh_token={token_resp.refresh_token}"
        f"&provider=google"
    )
    return RedirectResponse(url=redirect_url)


# ── Microsoft OAuth2 ───────────────────────────────────────────────────────────

@router.get("/oauth/microsoft")
async def microsoft_login():
    """Step 1: Redirect the user to Microsoft's consent screen."""
    client = make_microsoft_client()
    uri, state = client.create_authorization_url(get_ms_authorize_url())
    return RedirectResponse(url=uri)


@router.get("/oauth/microsoft/callback")
async def microsoft_callback(code: str, db: Session = Depends(get_db)):
    """Step 2: Microsoft redirects here with an authorization code."""
    client = make_microsoft_client()

    # Exchange code for token
    token = await client.fetch_token(
        get_ms_token_url(),
        code=code,
        redirect_uri=MICROSOFT_REDIRECT_URI,
    )

    # Fetch profile from Microsoft Graph API
    resp = await client.get(MICROSOFT_USERINFO_URL)
    profile = resp.json()

    # Microsoft Graph returns "mail" or "userPrincipalName"
    ms_email = profile.get("mail") or profile.get("userPrincipalName")
    ms_name = profile.get("displayName", ms_email)

    if not ms_email:
        raise HTTPException(status_code=400, detail="Microsoft did not return an email address")

    user = service.get_or_create_oauth_user(db, "microsoft", ms_email, ms_name)

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")

    token_resp = service._build_token_response(user)
    redirect_url = (
        f"{FRONTEND_URL}/oauth-callback"
        f"?access_token={token_resp.access_token}"
        f"&refresh_token={token_resp.refresh_token}"
        f"&provider=microsoft"
    )
    return RedirectResponse(url=redirect_url)

@router.post("/mfa/enable", response_model=models.UserOut)
def enable_mfa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.enable_mfa(db, current_user)


@router.post("/mfa/disable", response_model=models.UserOut)
def disable_mfa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.disable_mfa(db, current_user)