import datetime as dt

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app import models, schemas
from app.security import generate_raw_token, hash_token, hash_password
from app.email_utils import send_password_reset_email

router = APIRouter(prefix="/api/auth/password", tags=["password"])


@router.post("/forgot", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower()).first()

    # Always return 202 regardless of whether the account exists,
    # so attackers can't use this endpoint to enumerate registered emails.
    if user:
        raw_token = generate_raw_token()
        reset_token = models.PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=dt.datetime.utcnow() + dt.timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
        )
        db.add(reset_token)
        db.commit()

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        send_password_reset_email(user.email, reset_link)

    return {"message": "If an account with that email exists, a recovery link has been sent."}


@router.post("/reset", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.token)
    reset_token = (
        db.query(models.PasswordResetToken)
        .filter(models.PasswordResetToken.token_hash == token_hash)
        .first()
    )

    from fastapi import HTTPException

    if (
        not reset_token
        or reset_token.used
        or reset_token.expires_at < dt.datetime.utcnow()
    ):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired")

    user = db.get(models.User, reset_token.user_id)
    user.hashed_password = hash_password(payload.new_password)
    reset_token.used = True

    # Revoke all existing sessions - a password reset should log out every device
    for s in user.sessions:
        s.is_revoked = True

    db.add_all([user, reset_token, *user.sessions])
    db.commit()
