import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.auth import models, service, oauth
from src.auth.dependencies import (
    get_current_user, decode_token, create_access_token, create_refresh_token,
    create_mfa_challenge_token, create_reset_token, hash_password,
)
from src.entities.user import User

router = APIRouter()


@router.post("/login")
def login(credentials: models.LoginRequest, db: Session = Depends(get_db)):
    user = service.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
    if user.mfa_enabled:
        return models.MFAChallengeResponse(mfa_token=create_mfa_challenge_token(user.id))
    return service._build_token_response(user)


@router.post("/mfa/verify", response_model=models.TokenResponse)
def mfa_verify(body: models.MFAVerifyRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.mfa_token)
    if payload.get("type") != "mfa":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA token")
    user = db.query(User).filter(User.id == uuid.UUID(str(payload["sub"]))).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not service.verify_mfa_code(user, body.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA code")
    return service._build_token_response(user)


@router.post("/mfa/setup", response_model=models.MFASetupResponse)
def mfa_setup(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.mfa_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA already enabled")
    secret, uri = service.provision_mfa_secret(current_user, db)
    return models.MFASetupResponse(secret=secret, otpauth_uri=uri)


@router.post("/mfa/enable", status_code=status.HTTP_204_NO_CONTENT)
def mfa_enable(body: models.MFAEnableRequest,
               current_user: User = Depends(get_current_user),
               db: Session = Depends(get_db)):
    if current_user.mfa_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA already enabled")
    if not service.verify_mfa_code(current_user, body.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA code")
    current_user.mfa_enabled = True
    db.commit()


@router.post("/mfa/disable", status_code=status.HTTP_204_NO_CONTENT)
def mfa_disable(body: models.MFADisableRequest,
                current_user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    if not current_user.mfa_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA is not enabled")
    if not service.verify_mfa_code(current_user, body.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA code")
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    db.commit()


@router.post("/signup", response_model=models.TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(data: models.SignupRequest, db: Session = Depends(get_db)):
    return service.register_user(db, data)


@router.post("/refresh", response_model=models.TokenResponse)
def refresh(body: models.RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == uuid.UUID(str(user_id))).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return service._build_token_response(user)


@router.get("/me", response_model=models.MeResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return models.MeResponse(user=models.UserOut.model_validate(current_user))


@router.post("/forgot-password", response_model=models.ForgotPasswordResponse)
def forgot_password(body: models.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        return models.ForgotPasswordResponse(
            message="If that email is registered, a password reset link has been sent.",
            reset_token="",
        )
    token = create_reset_token(user.id)
    return models.ForgotPasswordResponse(
        message="If that email is registered, a password reset link has been sent.",
        reset_token=token,
    )


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(body: models.ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.reset_token)
    if payload.get("type") != "reset":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")
    user = db.query(User).filter(User.id == uuid.UUID(str(payload["sub"]))).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.hashed_password = hash_password(body.new_password)
    db.commit()


@router.get("/oauth/{provider}")
def oauth_login(provider: str, request: Request):
    auth_url = oauth.get_authorization_url(provider)
    return RedirectResponse(auth_url)


@router.get("/oauth/{provider}/callback")
async def oauth_callback(provider: str, code: str, db: Session = Depends(get_db)):
    try:
        user_info = await oauth.fetch_user_info(provider, code)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"OAuth failed: {e}")
    user = service.get_or_create_oauth_user(db, email=user_info["email"], name=user_info.get("name", ""))
    token_resp = service._build_token_response(user)
    frontend_url = oauth.FRONTEND_URL.rstrip("/")
    redirect_uri = f"{frontend_url}/oauth/callback?access_token={token_resp.access_token}&refresh_token={token_resp.refresh_token}"
    return RedirectResponse(redirect_uri)
