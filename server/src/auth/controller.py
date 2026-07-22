from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from src.database.core import get_db

from src.auth import service

from src.auth.jwt import verify_token

from src.auth.models import (
    SignupRequest,
    SignupResponse,
    VerifyEmailRequest,
    LoginRequest,
    VerifyOTPRequest,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==========================================================
# SIGNUP
# ==========================================================

@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED
)
def signup(
    request: SignupRequest,
    db: Session = Depends(get_db)
):

    try:

        service.signup(
            db,
            request.username,
            request.email,
            request.password
        )

        return {
            "message": "Signup successful. Please verify your email."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==========================================================
# VERIFY EMAIL
# ==========================================================

from fastapi.responses import RedirectResponse
import os


# ==========================================
# VERIFY EMAIL
# ==========================================

@router.get(
    "/verify-email"
)
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):

    try:

        service.verify_email(
            db,
            token
        )


        return {
            "message":
            "Email verified successfully"
        }


    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ==========================================================
# LOGIN
# ==========================================================

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    try:

        service.login(
            db,
            request.email,
            request.password
        )

        return {
            "message": "OTP sent successfully."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==========================================================
# VERIFY OTP
# ==========================================================

@router.post(
    "/verify-otp",
    response_model=TokenResponse
)
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):

    try:

        return service.verify_otp(
            db,
            request.email,
            request.otp_code
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==========================================================
# REFRESH TOKEN
# ==========================================================

@router.post("/refresh")
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):

    try:

        return service.refresh_token(
            db,
            request.refresh_token
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==========================================================
# LOGOUT
# ==========================================================

@router.post("/logout")
def logout(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):

    try:

        payload = verify_token(
            request.refresh_token,
            "refresh"
        )

        if payload is None:

            raise ValueError(
                "Invalid refresh token."
            )

        service.logout_all(
            db,
            payload["sub"]
        )

        return {
            "message": "Logged out successfully."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==========================================================
# FORGOT PASSWORD
# ==========================================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    try:

        service.forgot_password(
            db,
            request.email
        )

        return {
            "message": "Password reset email sent."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==========================================================
# RESET PASSWORD
# ==========================================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    try:

        service.reset_password(
            db,
            request.token,
            request.new_password
        )

        return {
            "message": "Password updated successfully."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )