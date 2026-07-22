# server/src/auth/service.py

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
from datetime import datetime, timedelta, timezone

from src.analytics.services import log_event
from src.analytics.constants import (
    AnalyticsEventType,
    AnalyticsEventStatus,
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# In-memory store for OTPs: {user_id: {"otp": str, "expires_at": datetime}}
otp_store = {}


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
    Authenticate a user by email/password.
    Logs SUCCESS or FAILED login analytics event.
    """
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.hashed_password):
        # ── Log FAILED login attempt ────────────────────────────────────────
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

    # ── Log SUCCESSFUL login ────────────────────────────────────────────────
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
    """
    Build token response and optionally store a LoginSession row when db and request are provided.
    """
    token_data = {"sub": str(user.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Store login session if possible
    if db is not None and request is not None:
        try:
            # Lazy import to avoid circular issues
            from src.entities.login_session import LoginSession
            # Parse user agent
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

            # Location unknown by default
            location = "Unknown"

            # Mark previous sessions' is_current=False for this user's sessions
            try:
                db.query(LoginSession).filter(LoginSession.user_id == user.id, LoginSession.is_current == True).update({"is_current": False})
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
        except Exception:
            # Don't fail login if session saving fails; just continue
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
    """Generate a 6-digit OTP, store with 5-min expiry, email to user."""
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    otp_store[user_id] = {"otp": code, "expires_at": expires_at}

    if to_email:
        email_service.send_otp_email(to_email, code, user_name)
    else:
        print(
            f"[OTP] Code for user {user_id}: {code} (expires {expires_at} UTC)",
            flush=True,
        )

    return code


def verify_otp_code(
    user_id: int,
    code: str,
    db: Session | None = None,
    ip_address: str | None = None,
) -> bool:
    """Verify OTP. Logs SECURITY event on failure."""
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

    # Valid OTP
    otp_store.pop(user_id, None)
    return True


def build_mfa_pending_response(user: User) -> TokenResponse:
    """Build MFA-pending response and send OTP to user's email."""
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
    """Generate password reset token and email link to user."""
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

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(new_password)
    db.commit()

    # ── Log SECURITY event for password reset ──────────────────────────────
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
        # Create new user with random password
        random_password = secrets.token_urlsafe(16)
        is_first = db.query(User).count() == 0
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(random_password),
            role="admin" if is_first else "member",
            plan="enterprise" if is_first else "free",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # ── Log OAuth registration ─────────────────────────────────────────
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
        # ── Log OAuth login ────────────────────────────────────────────────
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

    # ── Log MFA enable as SECURITY event ───────────────────────────────────
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
    db.commit()
    return True