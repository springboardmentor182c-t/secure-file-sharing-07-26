import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app import models
from app.routers.auth import _create_session, _set_refresh_cookie
from app.security import create_access_token

router = APIRouter(prefix="/api/auth/oauth", tags=["oauth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def _microsoft_urls():
    tenant = settings.MICROSOFT_TENANT_ID
    return (
        f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
        f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
        "https://graph.microsoft.com/oidc/userinfo",
    )


def _get_or_create_oauth_user(db: Session, provider: str, provider_account_id: str, email: str, full_name: str):
    link = (
        db.query(models.OAuthAccount)
        .filter(
            models.OAuthAccount.provider == provider,
            models.OAuthAccount.provider_account_id == provider_account_id,
        )
        .first()
    )
    if link:
        return link.user

    user = db.query(models.User).filter(models.User.email == email.lower()).first()
    if not user:
        user = models.User(full_name=full_name, email=email.lower(), hashed_password=None, is_email_verified=True)
        db.add(user)
        db.flush()

    db.add(models.OAuthAccount(user_id=user.id, provider=provider, provider_account_id=provider_account_id))
    db.commit()
    db.refresh(user)
    return user


# ── Google ───────────────────────────────────────────────────────────────
@router.get("/google/login")
def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{query}")


@router.get("/google/callback")
def google_callback(code: str, request: Request, response: Response, db: Session = Depends(get_db)):
    with httpx.Client() as client:
        token_resp = client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Failed to exchange code with Google")

        access_token = token_resp.json()["access_token"]
        userinfo_resp = client.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
        info = userinfo_resp.json()

    user = _get_or_create_oauth_user(
        db, "google", info["sub"], info["email"], info.get("name", info["email"])
    )

    jwt_access = create_access_token(user.id)
    raw_refresh = _create_session(db, user, request)
    _set_refresh_cookie(response, raw_refresh)

    # Redirect back to the SPA with the access token in a URL fragment (never as a query param, to avoid logs)
    return RedirectResponse(f"{settings.FRONTEND_URL}/oauth/callback#access_token={jwt_access}")


# ── Microsoft ────────────────────────────────────────────────────────────
@router.get("/microsoft/login")
def microsoft_login():
    auth_url, _, _ = _microsoft_urls()
    params = {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile offline_access",
        "response_mode": "query",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"{auth_url}?{query}")


@router.get("/microsoft/callback")
def microsoft_callback(code: str, request: Request, response: Response, db: Session = Depends(get_db)):
    _, token_url, userinfo_url = _microsoft_urls()

    with httpx.Client() as client:
        token_resp = client.post(
            token_url,
            data={
                "code": code,
                "client_id": settings.MICROSOFT_CLIENT_ID,
                "client_secret": settings.MICROSOFT_CLIENT_SECRET,
                "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Failed to exchange code with Microsoft")

        access_token = token_resp.json()["access_token"]
        userinfo_resp = client.get(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
        info = userinfo_resp.json()

    email = info.get("email") or info.get("preferred_username")
    user = _get_or_create_oauth_user(db, "microsoft", info["sub"], email, info.get("name", email))

    jwt_access = create_access_token(user.id)
    raw_refresh = _create_session(db, user, request)
    _set_refresh_cookie(response, raw_refresh)

    return RedirectResponse(f"{settings.FRONTEND_URL}/oauth/callback#access_token={jwt_access}")
