import base64
import secrets
import io

import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import (
    verify_password,
    hash_token,
    create_access_token,
    decode_token,
)
from app.dependencies import get_current_user
from app.routers.auth import _create_session, _set_refresh_cookie

router = APIRouter(prefix="/api/auth/mfa", tags=["mfa"])

ISSUER_NAME = "TrustShare"


# ── Setup: generate a secret + QR code (not yet enabled) ────────────────
@router.post("/setup", response_model=schemas.MFASetupResponse)
def setup_mfa(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    secret = pyotp.random_base32()
    current_user.mfa_secret = secret  # stored but mfa_enabled stays False until verified
    db.add(current_user)
    db.commit()

    otpauth_url = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email, issuer_name=ISSUER_NAME
    )

    img = qrcode.make(otpauth_url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    return schemas.MFASetupResponse(secret=secret, otpauth_url=otpauth_url, qr_code_base64=qr_b64)


# ── Enable: confirm the first code, turn MFA on, issue backup codes ─────
@router.post("/enable", response_model=schemas.MFAEnableResponse)
def enable_mfa(
    payload: schemas.MFAEnableRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.mfa_secret:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Call /mfa/setup first")

    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid code")

    backup_codes = [secrets.token_hex(4) for _ in range(8)]
    hashed_codes = ",".join(hash_token(c) for c in backup_codes)

    current_user.mfa_enabled = True
    current_user.mfa_backup_codes = hashed_codes
    db.add(current_user)
    db.commit()

    return schemas.MFAEnableResponse(backup_codes=backup_codes)


# ── Verify: second step of login, exchanges mfa_token + code for tokens ─
@router.post("/verify", response_model=schemas.TokenResponse)
def verify_mfa(
    payload: schemas.MFAVerifyRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    claims = decode_token(payload.mfa_token)
    if not claims or claims.get("type") != "mfa_pending":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "MFA session expired, please log in again")

    user = db.get(models.User, claims["sub"])
    if not user or not user.mfa_enabled:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "MFA not enabled for this user")

    valid = False
    totp = pyotp.TOTP(user.mfa_secret)
    if totp.verify(payload.code, valid_window=1):
        valid = True
    elif user.mfa_backup_codes:
        # allow single-use backup code as fallback
        codes = user.mfa_backup_codes.split(",")
        code_hash = hash_token(payload.code)
        if code_hash in codes:
            valid = True
            codes.remove(code_hash)
            user.mfa_backup_codes = ",".join(codes)
            db.add(user)

    if not valid:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid authentication code")

    access_token = create_access_token(user.id)
    raw_refresh = _create_session(db, user, request)
    _set_refresh_cookie(response, raw_refresh)
    db.commit()

    return schemas.TokenResponse(access_token=access_token)


# ── Disable ──────────────────────────────────────────────────────────────
@router.post("/disable", status_code=status.HTTP_204_NO_CONTENT)
def disable_mfa(
    payload: schemas.MFADisableRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.hashed_password or not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect password")

    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    current_user.mfa_backup_codes = None
    db.add(current_user)
    db.commit()
