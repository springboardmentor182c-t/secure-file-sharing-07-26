import secrets

from datetime import (
    datetime,
    timedelta,
    timezone
)

from sqlalchemy.orm import Session


from src.entities.user import User
from src.entities.role import Role
from src.entities.user_profile import UserProfile
from src.entities.email_verification import EmailVerificationToken
from src.entities.mfa import MFACode
from src.entities.session import UserSession
from src.entities.password_reset import PasswordResetToken


from src.auth.security import (
    hash_password,
    verify_password
)


from src.auth.email import (
    send_otp_email,
    send_verification_email,
    send_password_reset_email
)


from src.auth.otp import (
    generate_otp,
    get_otp_expiry,
    is_otp_expired
)


from src.auth.jwt import (
    create_access_token,
    create_refresh_token,
    verify_token
)



# ==========================================
# SIGNUP
# ==========================================

def signup(
    db: Session,
    username: str,
    email: str,
    password: str
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing_user:
        raise ValueError(
            "Email already registered"
        )


    existing_username = (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )

    if existing_username:
        raise ValueError(
            "Username already exists"
        )


    role = (
        db.query(Role)
        .filter(
            Role.role_name == "user"
        )
        .first()
    )


    if role is None:
        raise ValueError(
            "Default role not found"
        )


    user = User(

        role_id=role.id,

        username=username,

        email=email,

        password_hash=hash_password(
            password
        ),

        account_status="ACTIVE",

        email_verified=False

    )


    db.add(user)

    db.flush()



    profile = UserProfile(

        user_id=user.id

    )

    db.add(profile)



    # Create verification token

    verification_token = secrets.token_urlsafe(48)


    email_token = EmailVerificationToken(

        user_id=user.id,

        token=verification_token,

        expires_at=datetime.now(timezone.utc)
        +
        timedelta(hours=24)

    )


    db.add(email_token)


    db.commit()

    db.refresh(user)



    send_verification_email(
        user.email,
        verification_token
    )


    return user





# ==========================================
# VERIFY EMAIL
# ==========================================

from datetime import datetime, timezone


def verify_email(
    db: Session,
    token: str
):

    record = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.token == token
        )
        .first()
    )

    if record is None:
        raise ValueError(
            "Invalid verification token"
        )

    if record.is_used:

        user = (
            db.query(User)
            .filter(User.id == record.user_id)
            .first()
        )

        if user and user.email_verified:
            return {
                "message": "Your email is already verified."
            }

        raise ValueError(
            "Verification token already used"
        )

    # Handle timezone safely
    expiry = record.expires_at

    if expiry.tzinfo is None:
        expiry = expiry.replace(
            tzinfo=timezone.utc
        )

    if expiry < datetime.now(
        timezone.utc
    ):
        raise ValueError(
            "Verification token expired"
        )

    user = (
        db.query(User)
        .filter(
            User.id == record.user_id
        )
        .first()
    )

    if user is None:
        raise ValueError(
            "User not found"
        )

    user.email_verified = True

    record.is_used = True

    db.commit()

    return {
        "message": "Email verified successfully"
    }





# ==========================================
# LOGIN
# ==========================================

def login(
    db: Session,
    email: str,
    password: str
):


    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if user is None:

        raise ValueError(
            "Invalid email or password"
        )



    if not verify_password(
        password,
        user.password_hash
    ):

        raise ValueError(
            "Invalid email or password"
        )



    if not user.email_verified:

        raise ValueError(
            "Email not verified"
        )



    otp = generate_otp()



    mfa = MFACode(

        user_id=user.id,

        otp_code=otp,

        expires_at=get_otp_expiry(),

        verified=False

    )


    db.add(mfa)

    db.commit()



    send_otp_email(
        user.email,
        otp
    )


    return {
        "message":
        "OTP sent successfully"
    }





# ==========================================
# VERIFY OTP
# ==========================================
def verify_otp(
    db: Session,
    email: str,
    otp_code: str
):

    # ==========================================
    # FIND USER
    # ==========================================

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if user is None:

        raise ValueError(
            "User not found"
        )

    # ==========================================
    # GET USER ROLE
    # ==========================================

    role = (
        db.query(Role)
        .filter(
            Role.id == user.role_id
        )
        .first()
    )

    role_name = (
        role.role_name
        if role
        else "user"
    )

    # ==========================================
    # FIND LATEST UNUSED OTP
    # ==========================================

    mfa = (
        db.query(MFACode)
        .filter(
            MFACode.user_id == user.id,
            MFACode.otp_code == otp_code,
            MFACode.verified == False
        )
        .order_by(
            MFACode.created_at.desc()
        )
        .first()
    )

    if mfa is None:

        raise ValueError(
            "Invalid OTP"
        )

    # ==========================================
    # CHECK OTP EXPIRY
    # ==========================================

    if is_otp_expired(
        mfa.expires_at
    ):

        raise ValueError(
            "OTP expired"
        )

    # ==========================================
    # MARK OTP VERIFIED
    # ==========================================

    mfa.verified = True

    # ==========================================
    # CREATE JWT TOKENS
    # ==========================================

    access_token = create_access_token(
        str(user.id),
        role_name
    )

    refresh_token = create_refresh_token(
        str(user.id)
    )

    # ==========================================
    # CREATE LOGIN SESSION
    # ==========================================

    session = UserSession(

        user_id=user.id,

        refresh_token=refresh_token,

        expires_at=datetime.now(timezone.utc)
        +
        timedelta(days=7)

    )

    db.add(session)

    # ==========================================
    # UPDATE LAST LOGIN
    # ==========================================

    user.last_login = datetime.now(
        timezone.utc
    )

    db.commit()

    # ==========================================
    # RETURN TOKENS
    # ==========================================

    return {

        "access_token": access_token,

        "refresh_token": refresh_token,

        "token_type": "bearer",

        "role": role_name

    }





# ==========================================
# REFRESH TOKEN
# ==========================================

def refresh_token(
    db: Session,
    refresh_token: str
):


    payload = verify_token(
        refresh_token,
        "refresh"
    )


    if payload is None:

        raise ValueError(
            "Invalid refresh token"
        )



    session = (
        db.query(UserSession)
        .filter(
            UserSession.refresh_token == refresh_token
        )
        .first()
    )


    if session is None:

        raise ValueError(
            "Session not found"
        )



    if session.expires_at < datetime.now(timezone.utc):

        raise ValueError(
            "Session expired"
        )



    access = create_access_token(
        payload["sub"]
    )


    return {

        "access_token": access,

        "token_type": "bearer"

    }





# ==========================================
# LOGOUT ALL
# ==========================================

def logout_all(
    db: Session,
    user_id
):

    (
        db.query(UserSession)
        .filter(
            UserSession.user_id == user_id
        )
        .delete()
    )


    db.commit()





# ==========================================
# FORGOT PASSWORD
# ==========================================

def forgot_password(
    db: Session,
    email: str
):


    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if user is None:

        raise ValueError(
            "User not found"
        )



    token = secrets.token_urlsafe(48)



    reset = PasswordResetToken(

        user_id=user.id,

        token=token,

        expires_at=datetime.now(timezone.utc)
        +
        timedelta(minutes=30),

        is_used=False

    )



    db.add(reset)

    db.commit()



    send_password_reset_email(
        user.email,
        token
    )





# ==========================================
# RESET PASSWORD
# ==========================================
from datetime import datetime, timezone
def reset_password(
    db: Session,
    token: str,
    new_password: str
):


    reset = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == token
        )
        .first()
    )


    if reset is None:

        raise ValueError(
            "Invalid reset token"
        )


    if reset.is_used:

        raise ValueError(
            "Token already used"
        )



    expiry = reset.expires_at

    if expiry.tzinfo is None:
        expiry = expiry.replace(
            tzinfo=timezone.utc
    )

    if expiry < datetime.now(timezone.utc):
        raise ValueError(
            "Token expired"
    )



    user = (
        db.query(User)
        .filter(
            User.id == reset.user_id
        )
        .first()
    )


    if user is None:

        raise ValueError(
            "User not found"
        )



    user.password_hash = hash_password(
        new_password
    )


    reset.is_used = True


    db.commit()



    return True