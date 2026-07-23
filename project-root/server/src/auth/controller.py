# server/src/auth/controller.py

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


# ── Helper: get client IP safely ──────────────────────────────────────────
def _get_client_ip(request: Request) -> str | None:
    # Prefer X-Forwarded-For if behind a proxy
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


@router.post("/login", response_model=models.TokenResponse)
def login(
    credentials: models.LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)

    user = service.authenticate_user(
        db,
        credentials.email,
        credentials.password,
        ip_address=ip,
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

    # Check if MFA is enabled
    if user.mfa_enabled:
        return service.build_mfa_pending_response(user)

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended"
        )
    # Store session when building token response
    return service._build_token_response(user, db=db, request=request)


@router.post("/login/swagger", response_model=models.TokenResponse)
def swagger_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    request: Request = None,
):
    ip = _get_client_ip(request)

    user = service.authenticate_user(
        db,
        form_data.username,  # username field carries the email
        form_data.password,
        ip_address=ip,
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

    return service._build_token_response(user, db=db, request=request)


@router.post(
    "/signup",
    response_model=models.TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    data: models.SignupRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)
    return service.register_user(db, data, ip_address=ip)


@router.get("/me", response_model=models.UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=models.TokenResponse)
def refresh(body: models.RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return service._build_token_response(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT — client just discards tokens
    return None


# ── MFA Endpoints ──────────────────────────────────────────────────────────

@router.post("/verify-otp", response_model=models.TokenResponse)
def verify_otp(
    body: models.VerifyOTPRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)
    payload = decode_token(body.mfa_token)
    if payload.get("type") != "mfa_pending":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA session token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    if not service.verify_otp_code(user.id, body.code, db=db, ip_address=ip):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code",
        )

    return service._build_token_response(user)


@router.post("/resend-otp")
def resend_otp(body: models.ResendOTPRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.mfa_token)
    if payload.get("type") != "mfa_pending":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA session token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    service.generate_otp(user.id, to_email=user.email, user_name=user.name)
    return {
        "status": "success",
        "message": "OTP resent to your registered email",
    }


# ── Password Recovery Endpoints ────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(
    body: models.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    service.request_password_reset(db, body.email)
    return {
        "status": "success",
        "message": "Password reset link generated if email exists",
    }


@router.post("/reset-password")
def reset_password(
    body: models.ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    ip = _get_client_ip(request)
    service.reset_password_in_db(
        db,
        body.token,
        body.new_password,
        ip_address=ip,
    )
    return {"status": "success", "message": "Password reset successfully"}


# ── Real OAuth2 Endpoints ─────────────────────────────────────────────────

import os
from src.auth.oauth_config import (
    make_google_client,
    make_microsoft_client,
    GOOGLE_AUTHORIZE_URL,
    GOOGLE_TOKEN_URL,
    GOOGLE_USERINFO_URL,
    GOOGLE_REDIRECT_URI,
    get_ms_authorize_url,
    get_ms_token_url,
    MICROSOFT_USERINFO_URL,
    MICROSOFT_REDIRECT_URI,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ── Google OAuth2 ──────────────────────────────────────────────────────────

@router.get("/oauth/google")
async def google_login():
    """Step 1: Redirect the user to Google's consent screen."""
    client = make_google_client()
    uri, state = client.create_authorization_url(GOOGLE_AUTHORIZE_URL)
    return RedirectResponse(url=uri)


@router.get("/oauth/google/callback")
async def google_callback(
    code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Step 2: Google redirects here with an authorization code."""
    ip = _get_client_ip(request)
    client = make_google_client()

    token = await client.fetch_token(
        GOOGLE_TOKEN_URL,
        code=code,
        redirect_uri=GOOGLE_REDIRECT_URI,
    )

    resp = await client.get(GOOGLE_USERINFO_URL)
    profile = resp.json()

    google_email = profile.get("email")
    google_name = profile.get("name", google_email)

    if not google_email:
        raise HTTPException(
            status_code=400,
            detail="Google did not return an email address",
        )

    user = service.get_or_create_oauth_user(
        db,
        "google",
        google_email,
        google_name,
        ip_address=ip,
    )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )

    token_resp = service._build_token_response(user)
    redirect_url = (
        f"{FRONTEND_URL}/oauth-callback"
        f"?access_token={token_resp.access_token}"
        f"&refresh_token={token_resp.refresh_token}"
        f"&provider=google"
    )
    return RedirectResponse(url=redirect_url)


# ── Microsoft OAuth2 ───────────────────────────────────────────────────────

@router.get("/oauth/microsoft")
async def microsoft_login():
    """Step 1: Redirect the user to Microsoft's consent screen."""
    client = make_microsoft_client()
    uri, state = client.create_authorization_url(get_ms_authorize_url())
    return RedirectResponse(url=uri)


@router.get("/oauth/microsoft/callback")
async def microsoft_callback(
    code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Step 2: Microsoft redirects here with an authorization code."""
    ip = _get_client_ip(request)
    client = make_microsoft_client()

    token = await client.fetch_token(
        get_ms_token_url(),
        code=code,
        redirect_uri=MICROSOFT_REDIRECT_URI,
    )

    resp = await client.get(MICROSOFT_USERINFO_URL)
    profile = resp.json()

    ms_email = profile.get("mail") or profile.get("userPrincipalName")
    ms_name = profile.get("displayName", ms_email)

    if not ms_email:
        raise HTTPException(
            status_code=400,
            detail="Microsoft did not return an email address",
        )

    user = service.get_or_create_oauth_user(
        db,
        "microsoft",
        ms_email,
        ms_name,
        ip_address=ip,
    )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended",
        )

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
@router.post("/change-password")
def change_password(
    body: models.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service.change_password(db, current_user, body.current_password, body.new_password)
    return {"status": "success", "message": "Password changed successfully"}
    return service.disable_mfa(db, current_user)


# ── User Storage Breakdown ────────────────────────────────────────────────

from sqlalchemy import func
from src.entities.file import File


@router.get("/me/storage-breakdown")
def storage_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns storage usage broken down by file type category.
    Used by the user dropdown for storage insights.
    """
    # Get all non-deleted files owned by user
    files = (
        db.query(File.mimetype, File.size)
        .filter(
            File.owner_id == current_user.id,
            File.is_deleted == False,
        )
        .all()
    )

    # Categorize by mimetype
    categories = {
        "documents": {"size": 0, "count": 0, "color": "#3b82f6"},
        "media":     {"size": 0, "count": 0, "color": "#8b5cf6"},
        "archives":  {"size": 0, "count": 0, "color": "#f59e0b"},
        "other":     {"size": 0, "count": 0, "color": "#94a3b8"},
    }

    for mimetype, size in files:
        mt = (mimetype or "").lower()
        size = size or 0

        if any(x in mt for x in ["pdf", "word", "excel", "spreadsheet",
                                   "presentation", "document", "text"]):
            cat = "documents"
        elif any(x in mt for x in ["image", "video", "audio"]):
            cat = "media"
        elif any(x in mt for x in ["zip", "rar", "7z", "tar", "gzip",
                                     "compressed", "archive"]):
            cat = "archives"
        else:
            cat = "other"

        categories[cat]["size"] += size
        categories[cat]["count"] += 1

    total = sum(c["size"] for c in categories.values())

    return {
        "total_bytes": total,
        "total_mb": round(total / (1024 * 1024), 2),
        "categories": [
            {
                "name": name.capitalize(),
                "size_bytes": cat["size"],
                "size_mb": round(cat["size"] / (1024 * 1024), 2),
                "count": cat["count"],
                "pct": round((cat["size"] / total * 100), 1) if total > 0 else 0,
                "color": cat["color"],
            }
            for name, cat in categories.items()
        ],
    }
