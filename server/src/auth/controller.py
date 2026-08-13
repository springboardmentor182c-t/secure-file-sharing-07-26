"""
Auth routes: signup, login, MFA (TOTP) challenge/enroll, OAuth stubs.
Response shape matches the shared ApiResponse envelope so the frontend's
`body?.data ?? body` unwrap works.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth import service
from src.auth.models import (
    AuthSuccessData,
    LoginRequest,
    MfaChallengeData,
    MfaDisableRequest,
    MfaEnableData,
    MfaEnableRequest,
    MfaRecoveryRequest,
    MfaSetupData,
    MfaVerifyRequest,
    SignupRequest,
    UserOut,
)
from src.database.core import get_db
from src.dependencies import get_current_user_id
from src.exceptions import InvalidPasswordError
from src.schemas import ApiResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=ApiResponse[AuthSuccessData])
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    user = service.register_user(
        db, full_name=payload.full_name, email=payload.email, password=payload.password
    )
    token = service.create_access_token(user.id)
    return ApiResponse(
        message="Account created.",
        data=AuthSuccessData(mfa_required=False, token=token, user=UserOut.from_user(user)),
    )


@router.post("/login", response_model=ApiResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = service.authenticate_user(db, email=payload.email, password=payload.password)

    if user.mfa:
        mfa_token = service.create_mfa_token(user.id)
        return ApiResponse(message="MFA required.", data=MfaChallengeData(mfa_token=mfa_token))

    token = service.create_access_token(user.id)
    return ApiResponse(
        message="Signed in.",
        data=AuthSuccessData(mfa_required=False, token=token, user=UserOut.from_user(user)),
    )


@router.post("/mfa/verify", response_model=ApiResponse[AuthSuccessData])
def mfa_verify(payload: MfaVerifyRequest, db: Session = Depends(get_db)):
    user_id = service.decode_token(payload.mfa_token, expected_type="mfa")
    user = service.get_user_by_id(db, user_id)
    service.verify_mfa_code(db, user, code=payload.code)

    token = service.create_access_token(user.id)
    return ApiResponse(
        message="Signed in.",
        data=AuthSuccessData(mfa_required=False, token=token, user=UserOut.from_user(user)),
    )


@router.post("/mfa/recovery", response_model=ApiResponse[AuthSuccessData])
def mfa_recovery(payload: MfaRecoveryRequest, db: Session = Depends(get_db)):
    user_id = service.decode_token(payload.mfa_token, expected_type="mfa")
    user = service.get_user_by_id(db, user_id)
    service.consume_recovery_code(db, user, recovery_code=payload.recovery_code)

    token = service.create_access_token(user.id)
    return ApiResponse(
        message="Signed in.",
        data=AuthSuccessData(mfa_required=False, token=token, user=UserOut.from_user(user)),
    )


# ---------- MFA enrollment (used from a logged-in settings page) ----------

@router.post("/mfa/setup", response_model=ApiResponse[MfaSetupData])
def mfa_setup(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    user = service.get_user_by_id(db, user_id)
    secret, uri = service.start_mfa_setup(db, user)
    return ApiResponse(message="Scan this in your authenticator app.", data=MfaSetupData(secret=secret, qr_provisioning_uri=uri))


@router.post("/mfa/enable", response_model=ApiResponse[MfaEnableData])
def mfa_enable(payload: MfaEnableRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    user = service.get_user_by_id(db, user_id)
    recovery_codes = service.enable_mfa(db, user, code=payload.code)
    return ApiResponse(message="Two-factor authentication enabled.", data=MfaEnableData(recovery_codes=recovery_codes))


@router.post("/mfa/disable", response_model=ApiResponse)
def mfa_disable(payload: MfaDisableRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    user = service.get_user_by_id(db, user_id)
    if not service.verify_password(payload.password, user.hashed_password):
        raise InvalidPasswordError("Incorrect password.")
    service.disable_mfa(db, user)
    return ApiResponse(message="Two-factor authentication disabled.")


@router.get("/me", response_model=ApiResponse[UserOut])
def me(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    user = service.get_user_by_id(db, user_id)
    return ApiResponse(data=UserOut.from_user(user))


# ---------- OAuth (stub — wire up real client IDs/secrets before use) ----------

@router.get("/oauth/{provider}")
def oauth_redirect(provider: str):
    """
    TODO: implement with authlib once GOOGLE_CLIENT_ID/SECRET and
    MICROSOFT_CLIENT_ID/SECRET are set. For now this just documents the
    contract: frontend does a full-page redirect here, backend redirects
    to the provider, then to `/auth/oauth/{provider}/callback`, then back
    to the frontend at `${FRONTEND_URL}/oauth/callback?token=...`.
    """
    from src.exceptions import NotFoundError
    raise NotFoundError(f"OAuth provider '{provider}' is not configured yet.", error_code="oauth_not_configured")