"""OAuth (social login) support for Google, Microsoft, and GitHub.

Flow (authorization-code):
  1. Frontend button  ->  GET /api/auth/oauth/{provider}          (this app)
  2. We redirect       ->  provider's authorize page
  3. Provider redirects->  GET /api/auth/oauth/{provider}/callback (this app)
  4. We exchange code  ->  provider token  ->  provider user info
  5. We redirect       ->  {FRONTEND_URL}/oauth/callback?access_token=...&refresh_token=...

The `state` value is a short-lived signed JWT so we don't need server-side
session storage to protect against CSRF.
"""
import os
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from jose import JWTError, jwt

from src.auth.dependencies import SECRET_KEY, ALGORITHM

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# ── Provider registry ───────────────────────────────────────────────────────
PROVIDERS = {
    "google": {
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "userinfo_url": "https://openidconnect.googleapis.com/v1/userinfo",
        "scope": "openid email profile",
        "client_id_env": "GOOGLE_CLIENT_ID",
        "client_secret_env": "GOOGLE_CLIENT_SECRET",
    },
    "microsoft": {
        "authorize_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "userinfo_url": "https://graph.microsoft.com/oidc/userinfo",
        "scope": "openid email profile",
        "client_id_env": "MICROSOFT_CLIENT_ID",
        "client_secret_env": "MICROSOFT_CLIENT_SECRET",
    },
    "github": {
        "authorize_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "userinfo_url": "https://api.github.com/user",
        "scope": "read:user user:email",
        "client_id_env": "GITHUB_CLIENT_ID",
        "client_secret_env": "GITHUB_CLIENT_SECRET",
    },
}


class OAuthError(Exception):
    """Raised for any recoverable OAuth problem; message is safe for redirect."""


def is_supported(provider: str) -> bool:
    return provider in PROVIDERS


def _credentials(provider: str) -> tuple[str, str]:
    cfg = PROVIDERS[provider]
    client_id = os.getenv(cfg["client_id_env"], "")
    client_secret = os.getenv(cfg["client_secret_env"], "")
    if not client_id or not client_secret:
        raise OAuthError("provider_not_configured")
    return client_id, client_secret


def redirect_uri(provider: str) -> str:
    return f"{BACKEND_URL}/api/auth/oauth/{provider}/callback"


# ── State (signed, short-lived) ─────────────────────────────────────────────
def create_state(provider: str) -> str:
    payload = {
        "provider": provider,
        "purpose": "oauth_state",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_state(provider: str, state: str) -> None:
    try:
        payload = jwt.decode(state, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise OAuthError("invalid_state")
    if payload.get("purpose") != "oauth_state" or payload.get("provider") != provider:
        raise OAuthError("invalid_state")


# ── Authorize URL ───────────────────────────────────────────────────────────
def build_authorize_url(provider: str) -> str:
    cfg = PROVIDERS[provider]
    client_id, _ = _credentials(provider)
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri(provider),
        "response_type": "code",
        "scope": cfg["scope"],
        "state": create_state(provider),
    }
    if provider == "google":
        params["access_type"] = "offline"
        params["prompt"] = "select_account"
    return f"{cfg['authorize_url']}?{urlencode(params)}"


# ── Code -> token -> user info ──────────────────────────────────────────────
async def exchange_code(provider: str, code: str) -> str:
    cfg = PROVIDERS[provider]
    client_id, client_secret = _credentials(provider)
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": redirect_uri(provider),
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(cfg["token_url"], data=data, headers={"Accept": "application/json"})
    if resp.status_code != 200:
        raise OAuthError("token_exchange_failed")
    token = resp.json().get("access_token")
    if not token:
        raise OAuthError("token_exchange_failed")
    return token


async def fetch_userinfo(provider: str, access_token: str) -> dict:
    """Return a normalized {'email': str, 'name': str} dict."""
    cfg = PROVIDERS[provider]
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(cfg["userinfo_url"], headers=headers)
        if resp.status_code != 200:
            raise OAuthError("userinfo_failed")
        info = resp.json()

        if provider == "github":
            email = info.get("email")
            if not email:
                emails_resp = await client.get("https://api.github.com/user/emails", headers=headers)
                if emails_resp.status_code == 200:
                    emails = emails_resp.json()
                    primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                    verified = next((e for e in emails if e.get("verified")), None)
                    email = (primary or verified or (emails[0] if emails else {})).get("email")
            name = info.get("name") or info.get("login")
        elif provider == "microsoft":
            email = info.get("email") or info.get("upn") or info.get("preferred_username")
            name = info.get("name")
        else:  # google
            email = info.get("email")
            name = info.get("name")

    if not email:
        raise OAuthError("no_email")
    return {"email": email, "name": name or email.split("@")[0]}


def frontend_success_url(access_token: str, refresh_token: str) -> str:
    q = urlencode({"access_token": access_token, "refresh_token": refresh_token})
    return f"{FRONTEND_URL}/oauth/callback?{q}"


def frontend_error_url(reason: str) -> str:
    q = urlencode({"error": reason})
    return f"{FRONTEND_URL}/oauth/callback?{q}"
