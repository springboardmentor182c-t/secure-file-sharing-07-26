"""
Stub email sender. In production, swap this out for SES, SendGrid, Postmark, etc.
For now it just logs the email to the console so you can copy the link during development.
"""
import logging

logger = logging.getLogger("email")


def send_password_reset_email(to_email: str, reset_link: str):
    logger.warning(f"[DEV EMAIL] Password reset link for {to_email}: {reset_link}")


def send_verification_email(to_email: str, verify_link: str):
    logger.warning(f"[DEV EMAIL] Verification link for {to_email}: {verify_link}")
