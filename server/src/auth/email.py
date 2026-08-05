import os
import smtplib

from dotenv import load_dotenv

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


load_dotenv()


EMAIL = os.getenv("EMAIL")

EMAIL_PASSWORD = os.getenv(
    "EMAIL_PASSWORD"
)


SMTP_SERVER = os.getenv(
    "SMTP_SERVER",
    "smtp.gmail.com"
)


SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        587
    )
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)



def send_email(
    recipient: str,
    subject: str,
    body: str
):

    if not EMAIL or not EMAIL_PASSWORD:

        raise ValueError(
            "EMAIL or EMAIL_PASSWORD missing in .env"
        )


    message = MIMEMultipart()

    message["From"] = EMAIL

    message["To"] = recipient

    message["Subject"] = subject


    message.attach(
        MIMEText(
            body,
            "plain"
        )
    )


    try:

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT
        ) as server:


            server.ehlo()

            server.starttls()

            server.ehlo()


            server.login(
                EMAIL,
                EMAIL_PASSWORD
            )


            server.sendmail(
                EMAIL,
                recipient,
                message.as_string()
            )


    except Exception as e:

        print(
            "EMAIL ERROR:",
            e
        )

        raise





def send_verification_email(
    recipient: str,
    token: str
):

    verification_link = (
        f"{FRONTEND_URL}"
        f"/email-verification"
        f"?token={token}"
    )


    body = f"""
Hello,

Welcome to TrustShare.

Please verify your email by clicking this link:

{verification_link}


This verification link expires in 24 hours.

If you did not create this account,
ignore this email.


Regards,
TrustShare Security Team
"""


    send_email(

        recipient,

        "Verify your TrustShare account",

        body

    )





def send_otp_email(
    recipient: str,
    otp: str
):

    body = f"""
Hello,

Your TrustShare login OTP is:

{otp}


This OTP expires in 5 minutes.


If you did not request this login,
secure your account immediately.


Regards,
TrustShare Security Team
"""


    send_email(

        recipient,

        "TrustShare Login Verification OTP",

        body

    )





def send_password_reset_email(
    recipient: str,
    token: str
):

    reset_link = (
        f"{FRONTEND_URL}"
        f"/reset-password"
        f"?token={token}"
    )


    body = f"""
Hello,

A password reset request was received
for your TrustShare account.


Reset your password using this link:

{reset_link}


This link expires in 30 minutes.


If you did not request this,
ignore this email.


Regards,
TrustShare Security Team
"""


    send_email(

        recipient,

        "TrustShare Password Reset",

        body

    )