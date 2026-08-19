from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Request
from src.entities.user import User
from src.auth.models import SignupRequest, TokenResponse, UserOut
from src.auth.dependencies import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from src.auth import email_service
import os
import random
import secrets
from collections import defaultdict
from threading import Lock
from datetime import datetime, timedelta, timezone

from src.analytics.services import log_event
from src.analytics.constants import (
    AnalyticsEventType,
    AnalyticsEventStatus,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ── FIX: Admin bootstrap via environment variable ──────────────────────────
BOOTSTRAP_ADMIN_EMAIL = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "").strip().lower()

# In-memory store for OTPs
otp_store = {}

# ── FIX: Track used password reset tokens — single use enforcement ──────────
_used_reset_tokens: set[str] = set()

DEFAULT_DEV_DUMMY_EMAIL_DOMAINS = "example.com,test.com,invalid,localhost"


# ═══════════════════════════════════════════════════════════════════════════
# LOGIN RATE LIMITING (Brute force protection)
# ═══════════════════════════════════════════════════════════════════════════

_login_attempts_email: dict[str, list[float]] = defaultdict(list)
_login_attempts_ip: dict[str, list[float]] = defaultdict(list)
_login_attempts_lock = Lock()

LOGIN_WINDOW_SECONDS = 15 * 60  # 15 minutes
LOGIN_MAX_PER_EMAIL = 5         # 5 attempts per email
LOGIN_MAX_PER_IP = 20           # 20 attempts per IP


def _check_login_rate_limit(email: str, ip_address: str | None) -> tuple[bool, int]:
    """
    Check if login attempt is allowed.

    Returns:
        (allowed, retry_after_seconds)
        - allowed = True → login can proceed
        - allowed = False → return retry_after seconds to wait
    """
    now = datetime.now(timezone.utc).timestamp()
    cutoff = now - LOGIN_WINDOW_SECONDS
    email_lower = (email or "").lower().strip()

    with _login_attempts_lock:
        # Prune expired entries
        _login_attempts_email[email_lower] = [
            t for t in _login_attempts_email[email_lower] if t > cutoff
        ]

        # Check email limit
        if len(_login_attempts_email[email_lower]) >= LOGIN_MAX_PER_EMAIL:
            oldest = _login_attempts_email[email_lower][0]
            retry_after = int(oldest + LOGIN_WINDOW_SECONDS - now)
            return False, max(1, retry_after)

        # Check IP limit
        if ip_address:
            _login_attempts_ip[ip_address] = [
                t for t in _login_attempts_ip[ip_address] if t > cutoff
            ]
            if len(_login_attempts_ip[ip_address]) >= LOGIN_MAX_PER_IP:
                oldest = _login_attempts_ip[ip_address][0]
                retry_after = int(oldest + LOGIN_WINDOW_SECONDS - now)
                return False, max(1, retry_after)

    return True, 0


def _record_failed_login(email: str, ip_address: str | None) -> None:
    """Track a failed login attempt."""
    now = datetime.now(timezone.utc).timestamp()
    email_lower = (email or "").lower().strip()
    with _login_attempts_lock:
        _login_attempts_email[email_lower].append(now)
        if ip_address:
            _login_attempts_ip[ip_address].append(now)


def _clear_login_attempts(email: str, ip_address: str | None) -> None:
    """Clear all login attempts for email (called on successful login)."""
    email_lower = (email or "").lower().strip()
    with _login_attempts_lock:
        _login_attempts_email.pop(email_lower, None)
        if ip_address:
            _login_attempts_ip.pop(ip_address, None)


# ═══════════════════════════════════════════════════════════════════════════
# ENVIRONMENT HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def _environment() -> str:
    return os.getenv("ENVIRONMENT", "development").strip().lower()


def _development_dummy_email_domains() -> set[str]:
    configured = os.getenv(
        "DEV_DUMMY_EMAIL_DOMAINS",
        DEFAULT_DEV_DUMMY_EMAIL_DOMAINS,
    )
    return {
        domain.strip().lower().lstrip("@")
        for domain in configured.split(",")
        if domain.strip()
    }


def _is_development_dummy_email(email: str) -> bool:
    if _environment() not in {"development", "dev"}:
        return False
    _, separator, domain = email.strip().lower().rpartition("@")
    return bool(separator and domain in _development_dummy_email_domains())


# ═══════════════════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════════════

def authenticate_user(
    db: Session,
    email: str,
    password: str,
    ip_address: str | None = None,
) -> User | None:
    """
    Authenticate user with brute force protection.

    Raises HTTPException 429 if rate limit exceeded.
    Returns None on invalid credentials.
    Returns User on success.
    """
    # ── Check rate limit BEFORE processing credentials ────────────────
    allowed, retry_after = _check_login_rate_limit(email, ip_address)
    if not allowed:
        # Log the rate limit event for security monitoring
        log_event(
            db,
            event_type=AnalyticsEventType.SECURITY,
            user_id=None,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "severity_key": "brute_force",
                "label": "Login rate limit exceeded",
                "detail": f"Too many login attempts for {email}",
                "target": email,
                "attempts": LOGIN_MAX_PER_EMAIL,
            },
        )
        db.commit()

        minutes = max(1, retry_after // 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Try again in {minutes} minute{'s' if minutes > 1 else ''}.",
            headers={"Retry-After": str(retry_after)},
        )

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.hashed_password):
        # ── Record failed attempt for rate limiting ─────────────────
        _record_failed_login(email, ip_address)

        log_event(
            db,
            event_type=AnalyticsEventType.LOGIN,
            user_id=user.id if user else None,
            status=AnalyticsEventStatus.FAILED,
            ip_address=ip_address,
            event_metadata={
                "target": email,
                "attempts": 1,
                "severity_key": "login_failed",
            },
        )
        db.commit()
        return None

    # ── Successful login — clear rate limit counters ────────────────
    _clear_login_attempts(email, ip_address)

    log_event(
        db,
        event_type=AnalyticsEventType.LOGIN,
        user_id=user.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={"target": email},
    )
    db.commit()
    return user


def register_user(
    db: Session,
    data: SignupRequest,
    request=None,
    ip_address: str | None = None,
) -> TokenResponse:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # ── FIX: Admin bootstrap via environment variable ──────────────────────
    is_first = db.query(User).count() == 0
    email_lower = data.email.strip().lower()

    if is_first and BOOTSTRAP_ADMIN_EMAIL and email_lower == BOOTSTRAP_ADMIN_EMAIL:
        role = "admin"
        plan = "enterprise"
    elif is_first and not BOOTSTRAP_ADMIN_EMAIL and _environment() in {"development", "dev"}:
        role = "admin"
        plan = "enterprise"
        print(
            "[BOOTSTRAP WARNING] BOOTSTRAP_ADMIN_EMAIL not set. "
            "First user gets admin in development only.",
            flush=True,
        )
    else:
        role = "member"
        plan = "free"

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=role,
        plan=plan,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    log_event(
        db,
        event_type=AnalyticsEventType.LOGIN,
        user_id=user.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={"action": "register", "target": data.email},
    )
    db.commit()

    return _build_token_response(user, db=db, request=request)


def _build_token_response(user: User, db: Session = None, request=None) -> TokenResponse:
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    if db is not None and request is not None:
        try:
            from src.entities.login_session import LoginSession
            ua_string = request.headers.get("user-agent", "")
            try:
                from user_agents import parse as parse_ua
                ua = parse_ua(ua_string) if ua_string else None
            except Exception:
                ua = None

            browser_name = ua.browser.family if ua else (ua_string.split("/")[0] if ua_string else "Unknown")
            os_name = ua.os.family if ua else None
            device_name = None
            if ua:
                if ua.is_pc:
                    device_type = "desktop"
                elif ua.is_tablet:
                    device_type = "tablet"
                elif ua.is_mobile:
                    device_type = "mobile"
                else:
                    device_type = "unknown"
                device_name = f"{os_name} {ua.device.family}" if os_name else ua.device.family
            else:
                device_type = "unknown"

            ip_address = None
            try:
                ip_address = request.client.host if request.client else None
            except Exception:
                ip_address = None

            location = "Unknown"

            try:
                db.query(LoginSession).filter(
                    LoginSession.user_id == user.id,
                    LoginSession.is_current == True
                ).update({"is_current": False})
            except Exception:
                pass

            session_row = LoginSession(
                user_id=user.id,
                device_name=device_name,
                browser_name=browser_name,
                device_type=device_type,
                ip_address=ip_address,
                location=location,
                last_active=None,
                refresh_token=refresh_token,
                is_current=True,
            )
            db.add(session_row)
            db.commit()
        except Exception as _session_err:
            try:
                print(
                    f"[SESSION SAVE ERROR] {type(_session_err).__name__}: {_session_err}",
                    flush=True,
                )
            except Exception:
                pass
            db.rollback()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
        mfa_required=False,
    )


# ═══════════════════════════════════════════════════════════════════════════
# MFA HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def generate_otp(user_id: int, to_email: str = "", user_name: str = "") -> str:
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    otp_store[user_id] = {"otp": code, "expires_at": expires_at}

    if _environment() in {"development", "dev"}:
        print(
            f"[OTP DEV] User {user_id} -> {code} "
            f"(expires {expires_at.strftime('%H:%M:%S')} UTC)",
            flush=True,
        )

    if to_email:
        if _is_development_dummy_email(to_email):
            domain = to_email.strip().lower().rpartition("@")[2]
            print(
                f"[EMAIL DEV] Skipping SMTP for configured dummy/test domain: {domain}",
                flush=True,
            )
        else:
            try:
                email_service.send_otp_email(to_email, code, user_name)
            except Exception as exc:
                print(
                    f"[EMAIL ERROR] Failed to send MFA email: {type(exc).__name__}",
                    flush=True,
                )

    return code


def verify_otp_code(
    user_id: int,
    code: str,
    db: Session | None = None,
    ip_address: str | None = None,
) -> bool:
    entry = otp_store.get(user_id)

    if not entry:
        if db:
            log_event(
                db,
                event_type=AnalyticsEventType.SECURITY,
                user_id=user_id,
                status=AnalyticsEventStatus.FAILED,
                ip_address=ip_address,
                event_metadata={
                    "severity_key": "login_failed",
                    "label": "OTP verification failed",
                    "detail": "No active OTP session found",
                    "target": "otp",
                    "attempts": 1,
                },
            )
            db.commit()
        return False

    if entry["otp"] != code:
        if db:
            log_event(
                db,
                event_type=AnalyticsEventType.SECURITY,
                user_id=user_id,
                status=AnalyticsEventStatus.FAILED,
                ip_address=ip_address,
                event_metadata={
                    "severity_key": "login_failed",
                    "label": "OTP verification failed",
                    "detail": "Incorrect OTP code entered",
                    "target": "otp",
                    "attempts": 1,
                },
            )
            db.commit()
        return False

    if datetime.now(timezone.utc) > entry["expires_at"]:
        otp_store.pop(user_id, None)
        if db:
            log_event(
                db,
                event_type=AnalyticsEventType.SECURITY,
                user_id=user_id,
                status=AnalyticsEventStatus.FAILED,
                ip_address=ip_address,
                event_metadata={
                    "severity_key": "login_failed",
                    "label": "OTP expired",
                    "detail": "OTP entered after expiry window",
                    "target": "otp",
                    "attempts": 1,
                },
            )
            db.commit()
        return False

    otp_store.pop(user_id, None)
    return True


def build_mfa_pending_response(user: User) -> TokenResponse:
    token_data = {"sub": str(user.id), "type": "mfa_pending"}
    mfa_token = create_access_token(
        token_data, expires_delta=timedelta(minutes=10)
    )
    generate_otp(user.id, to_email=user.email, user_name=user.name)
    return TokenResponse(mfa_required=True, mfa_token=mfa_token)


# ═══════════════════════════════════════════════════════════════════════════
# PASSWORD RECOVERY
# ═══════════════════════════════════════════════════════════════════════════

def request_password_reset(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return

    token_data = {"sub": str(user.id), "type": "password_recovery"}
    reset_token = create_access_token(
        token_data, expires_delta=timedelta(minutes=15)
    )

    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    email_service.send_reset_email(user.email, reset_link, user.name)


def reset_password_in_db(
    db: Session,
    token: str,
    new_password: str,
    ip_address: str | None = None,
) -> bool:
    from src.auth.dependencies import decode_token

    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    if payload.get("type") != "password_recovery":
        raise HTTPException(status_code=400, detail="Invalid token type")

    # ── FIX: Reject tokens that have already been used ─────────────────────
    if token in _used_reset_tokens:
        raise HTTPException(
            status_code=400,
            detail="This password reset link has already been used. Please request a new one.",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(new_password)

    # ── FIX: Mark token as used immediately after successful reset ──────────
    _used_reset_tokens.add(token)

    # Auto-cleanup if set grows too large
    if len(_used_reset_tokens) > 10000:
        _used_reset_tokens.clear()

    db.commit()

    log_event(
        db,
        event_type=AnalyticsEventType.SECURITY,
        user_id=user.id,
        status=AnalyticsEventStatus.SUCCESS,
        ip_address=ip_address,
        event_metadata={
            "severity_key": "admin_role",
            "label": "Password reset completed",
            "detail": f"Password reset for {user.email}",
            "target": user.email,
            "attempts": 1,
        },
    )
    db.commit()

    return True


# ═══════════════════════════════════════════════════════════════════════════
# OAUTH
# ═══════════════════════════════════════════════════════════════════════════

def get_or_create_oauth_user(
    db: Session,
    provider: str,
    email: str,
    name: str,
    ip_address: str | None = None,
) -> User:
    user = db.query(User).filter(User.email == email).first()

    if not user:
        random_password = secrets.token_urlsafe(16)

        # ── FIX: Same bootstrap logic for OAuth ───────────────────────────
        is_first = db.query(User).count() == 0
        email_lower = email.strip().lower()

        if is_first and BOOTSTRAP_ADMIN_EMAIL and email_lower == BOOTSTRAP_ADMIN_EMAIL:
            role = "admin"
            plan = "enterprise"
        elif is_first and not BOOTSTRAP_ADMIN_EMAIL and _environment() in {"development", "dev"}:
            role = "admin"
            plan = "enterprise"
        else:
            role = "member"
            plan = "free"

        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(random_password),
            role=role,
            plan=plan,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        log_event(
            db,
            event_type=AnalyticsEventType.LOGIN,
            user_id=user.id,
            status=AnalyticsEventStatus.SUCCESS,
            ip_address=ip_address,
            event_metadata={
                "action": "oauth_register",
                "provider": provider,
                "target": email,
            },
        )
        db.commit()
    else:
        log_event(
            db,
            event_type=AnalyticsEventType.LOGIN,
            user_id=user.id,
            status=AnalyticsEventStatus.SUCCESS,
            ip_address=ip_address,
            event_metadata={
                "action": "oauth_login",
                "provider": provider,
                "target": email,
            },
        )
        db.commit()

    return user


# ═══════════════════════════════════════════════════════════════════════════
# MFA TOGGLE
# ═══════════════════════════════════════════════════════════════════════════

def enable_mfa(db: Session, user: User) -> User:
    user.mfa_enabled = True
    db.commit()
    db.refresh(user)

    log_event(
        db,
        event_type=AnalyticsEventType.SECURITY,
        user_id=user.id,
        status=AnalyticsEventStatus.SUCCESS,
        event_metadata={
            "severity_key": "admin_role",
            "label": "MFA enabled",
            "detail": f"Multi-factor authentication enabled for {user.email}",
            "target": user.email,
            "attempts": 1,
        },
    )
    db.commit()

    return user


def disable_mfa(db: Session, user: User) -> User:
    user.mfa_enabled = False
    db.commit()
    db.refresh(user)

    log_event(
        db,
        event_type=AnalyticsEventType.SECURITY,
        user_id=user.id,
        status=AnalyticsEventStatus.WARNING,
        event_metadata={
            "severity_key": "unusual_access",
            "label": "MFA disabled",
            "detail": f"Multi-factor authentication disabled for {user.email}",
            "target": user.email,
            "attempts": 1,
        },
    )
    db.commit()

    return user


def change_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
) -> bool:
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    user.hashed_password = hash_password(new_password)
    try:
        from src.entities.login_session import LoginSession
        db.query(LoginSession).filter(
            LoginSession.user_id == user.id,
        ).update({"is_current": False}, synchronize_session=False)
    except Exception as _sess_err:
        print(f"[SESSION CLEANUP WARN] {type(_sess_err).__name__}: {_sess_err}", flush=True)

    db.commit()
    return True