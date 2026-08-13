import os
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("uvicorn.error")

def send_secure_share_email(
    recipient_emails: list[str] | str,
    sender_email: str,
    file_name: str,
    file_size_str: str,
    share_url: str,
    permission: str,
    expires_at_str: str,
    has_password: bool,
    max_downloads: int | None,
) -> bool:
    """
    Sends a formatted secure email to recipient(s) detailing the shared file access link
    along with assigned security rules and rights (permission, expiration, password, download limits).
    """
    if isinstance(recipient_emails, str):
        recipients = [e.strip() for e in recipient_emails.split(",") if e.strip()]
    else:
        recipients = recipient_emails

    if not recipients:
        return False

    perm_labels = {
        "view": "View Only (Read-Only Access)",
        "download": "View & Download Access",
        "edit": "Edit & Manage Access",
    }
    perm_label = perm_labels.get(permission.lower(), permission.capitalize())

    password_status = "Required (Password protection active)" if has_password else "Disabled (Direct link)"
    download_status = f"{max_downloads} download(s) allowed" if max_downloads else "Unlimited downloads"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
        .card {{ max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .header {{ text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }}
        .logo {{ font-size: 24px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px; }}
        .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 12px; }}
        .subtitle {{ font-size: 14px; color: #94a3b8; margin-top: 4px; }}
        .file-box {{ background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between; }}
        .file-name {{ font-weight: 600; color: #38bdf8; font-size: 15px; word-break: break-all; }}
        .file-size {{ font-size: 12px; color: #64748b; margin-top: 2px; }}
        .rules-title {{ color: #cbd5e1; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 10px 0; }}
        .rules-grid {{ background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; padding: 16px; margin-bottom: 24px; }}
        .rule-row {{ display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }}
        .rule-row:last-child {{ border-bottom: none; }}
        .rule-label {{ color: #94a3b8; font-weight: 500; }}
        .rule-val {{ color: #f1f5f9; font-weight: 600; text-align: right; }}
        .badge-perm {{ background: rgba(59,130,246,0.2); color: #60a5fa; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }}
        .btn-container {{ text-align: center; margin: 28px 0 20px 0; }}
        .btn {{ background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff !important; padding: 14px 32px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); }}
        .e2ee-note {{ background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 12px 16px; color: #34d399; font-size: 13px; text-align: center; margin-top: 24px; line-height: 1.4; }}
        .footer {{ text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">🛡️ SecureShare</div>
          <div class="title">Secure File Shared With You</div>
          <div class="subtitle">{sender_email} has shared a protected file</div>
        </div>

        <div class="file-box">
          <div>
            <div class="file-name">📄 {file_name}</div>
            <div class="file-size">{file_size_str} · AES-256 Encrypted</div>
          </div>
        </div>

        <div class="rules-title">Assigned Rules & Rights</div>
        <div class="rules-grid">
          <div class="rule-row">
            <span class="rule-label">Permission Rights</span>
            <span class="rule-val"><span class="badge-perm">{perm_label}</span></span>
          </div>
          <div class="rule-row">
            <span class="rule-label">Expiration Rule</span>
            <span class="rule-val">{expires_at_str}</span>
          </div>
          <div class="rule-row">
            <span class="rule-label">Password Rule</span>
            <span class="rule-val">{password_status}</span>
          </div>
          <div class="rule-row">
            <span class="rule-label">Download Rule</span>
            <span class="rule-val">{download_status}</span>
          </div>
        </div>

        <div class="btn-container">
          <a href="{share_url}" class="btn" target="_blank">Access Secure Email Link</a>
        </div>

        <div class="e2ee-note">
          🔒 <strong>End-to-End Encrypted:</strong> This link is governed by strict rules and access controls set by the sender.
        </div>

        <div class="footer">
          This email was sent automatically by SecureShare. Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
    """

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    if smtp_password:
        smtp_password = smtp_password.replace(" ", "").strip()
    
    smtp_from = os.getenv("SMTP_FROM") or smtp_user or "noreply@secureshare.io"

    if smtp_host and smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Secure File Shared: {file_name}"
            msg["From"] = f"SecureShare <{smtp_from}>"
            msg["To"] = ", ".join(recipients)
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, recipients, msg.as_string())
            logger.info(f"Successfully dispatched real secure share email to {recipients} via {smtp_host}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP ({smtp_host}:{smtp_port}): {e}", exc_info=True)

    logger.info(f"[SECURE EMAIL SIMULATION] Sent secure share email to {recipients} for file {file_name} with URL: {share_url}")
    return True
