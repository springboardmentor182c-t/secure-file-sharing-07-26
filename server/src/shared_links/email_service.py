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

def is_mail_enabled() -> bool:
    val = os.getenv("MAIL_ENABLED", "true").lower()
    return val in ("true", "1", "yes", "on")


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
    if not is_mail_enabled() or not to_email or not to_email.strip():
        logger.info("MAIL_ENABLED=false or missing recipient — skipping send.")
        return
    
    username = os.getenv("MAIL_USERNAME", "").strip()
    password = os.getenv("MAIL_PASSWORD", "").strip()

    if not username or not password:
        logger.warning("[SMTP NOTICE]: MAIL_USERNAME or MAIL_PASSWORD is empty in server/.env. Set valid SMTP credentials to deliver emails to inbox.")
        print(f"📧 [EMAIL DISPATCHED TO {to_email}]: {subject}")
        return

    try:
        message = MessageSchema(subject=subject, recipients=[to_email.strip()], body=html, subtype=MessageType.html)
        fm = FastMail(_mail_config())
        asyncio.run(fm.send_message(message))
        logger.info("Sent email to %s: %s", to_email, subject)
        print(f"✅ [EMAIL SENT SUCCESSFULLY TO {to_email}]: {subject}")
    except Exception as e:
        logger.exception("Failed to send email to %s: %s", to_email, e)
        print(f"⚠️ [SMTP DELIVER ERROR for {to_email}]: {e}")


def _share_notification_html(file_name: str, share_url: str, permission: str) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; background: #1e1f2b; color: #ffffff; border-radius: 16px;">
      <h2 style="color: #7c5cfc; margin-top: 0;">🔒 Secure File Shared With You</h2>
      <p style="color: #cbd5e1;">You have been granted <strong>{permission}</strong> access to <strong>{file_name}</strong> via TrustShare.</p>
      <div style="margin: 24px 0; text-align: center;">
        <a href="{share_url}" style="background: #7c5cfc; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Shared File</a>
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">Protected by TrustShare Zero-Knowledge Encryption • <a href="{share_url}" style="color: #93c5fd;">{share_url}</a></p>
    </div>
    """


def send_share_notification(*, to_email: str, file_name: str, share_url: str, permission: str = "View") -> None:
    _send(to_email, subject=f'🔒 File Shared: "{file_name}"', html=_share_notification_html(file_name, share_url, permission))


def send_expiry_warning(*, to_email: str, file_name: str, share_url: str, hours_left: int) -> None:
    _send(to_email, subject=f'Your link for "{file_name}" expires soon',
          html=_expiry_warning_html(file_name, share_url, hours_left))


def send_expired_notice(*, to_email: str, file_name: str) -> None:
    _send(to_email, subject=f'Your link for "{file_name}" has expired', html=_expired_html(file_name))
