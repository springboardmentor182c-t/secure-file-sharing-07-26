"""
Email delivery via FastAPI-Mail.

FastAPI-Mail's send API is async; this project's routes/services are sync,
so `send_expiry_warning` / `send_expired_notice` wrap the async call with
`asyncio.run()`. Gated behind MAIL_ENABLED so local dev/CI works with no
SMTP credentials at all — emails are just logged instead of sent.
"""
import asyncio
import logging
import os

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

logger = logging.getLogger("app.email")

MAIL_ENABLED = os.getenv("MAIL_ENABLED", "false").lower() == "true"


def _mail_config() -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
        MAIL_FROM=os.getenv("MAIL_FROM", "no-reply@trustshare.example.com"),
        MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "TrustShare"),
        MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
        MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "true").lower() == "true",
        MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "false").lower() == "true",
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )


def _expiry_warning_html(file_name: str, share_url: str, hours_left: int) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#8b7cf6;">Your shared link is expiring soon</h2>
      <p>The link for <strong>{file_name}</strong> will expire in about <strong>{hours_left} hours</strong>.</p>
      <p><a href="{share_url}" style="color:#8b7cf6;">{share_url}</a></p>
      <p style="color:#888; font-size:12px;">TrustShare Secure File Sharing</p>
    </div>
    """


def _expired_html(file_name: str) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#f15b6c;">Your shared link has expired</h2>
      <p>The link for <strong>{file_name}</strong> is no longer accessible.</p>
      <p style="color:#888; font-size:12px;">TrustShare Secure File Sharing</p>
    </div>
    """


def _send(to_email: str, *, subject: str, html: str) -> None:
    if not MAIL_ENABLED:
        logger.info("MAIL_ENABLED=false — skipping send. Would have emailed %s: %s", to_email, subject)
        return
    try:
        message = MessageSchema(subject=subject, recipients=[to_email], body=html, subtype=MessageType.html)
        fm = FastMail(_mail_config())
        asyncio.run(fm.send_message(message))
        logger.info("Sent email to %s: %s", to_email, subject)
    except Exception:
        logger.exception("Failed to send email to %s", to_email)


def send_expiry_warning(*, to_email: str, file_name: str, share_url: str, hours_left: int) -> None:
    _send(to_email, subject=f'Your link for "{file_name}" expires soon',
          html=_expiry_warning_html(file_name, share_url, hours_left))


def send_expired_notice(*, to_email: str, file_name: str) -> None:
    _send(to_email, subject=f'Your link for "{file_name}" has expired', html=_expired_html(file_name))
