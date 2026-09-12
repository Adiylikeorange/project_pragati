"""
Email service for PRAGATI.
Sends password reset emails via SMTP (aiosmtplib).
Falls back to console logging when SMTP is not configured.
"""

import logging
from datetime import datetime

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _build_reset_email_html(reset_link: str, user_name: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>PRAGATI Password Reset</title></head>
<body style="font-family: 'Public Sans', Arial, sans-serif; background: #F8FAFC; padding: 40px 0;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
    <div style="background: #0A2540; padding: 28px 32px;">
      <h1 style="color: white; margin: 0; font-size: 1.4rem; letter-spacing: 0.05em;">PRAGATI</h1>
      <p style="color: #94A3B8; font-size: 0.75rem; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.05em;">Infrastructure Project Monitoring</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #0F172A; font-size: 1.2rem; margin: 0 0 12px;">Reset Your Password</h2>
      <p style="color: #334155; font-size: 0.9rem; line-height: 1.6; margin: 0 0 24px;">
        Hello {user_name},<br><br>
        We received a request to reset your PRAGATI account password.
        Click the button below to create a new password. This link expires in 60 minutes.
      </p>
      <a href="{reset_link}"
         style="display: inline-block; background: #0A2540; color: white; text-decoration: none;
                padding: 12px 28px; border-radius: 6px; font-size: 0.9rem; font-weight: 600;">
        Reset Password
      </a>
      <p style="color: #64748B; font-size: 0.8rem; margin: 24px 0 0; line-height: 1.5;">
        If you did not request a password reset, you can safely ignore this email.
        Your password will not be changed.<br><br>
        Or copy and paste this link into your browser:<br>
        <a href="{reset_link}" style="color: #1E3A8A; word-break: break-all;">{reset_link}</a>
      </p>
    </div>
    <div style="background: #F1F5F9; padding: 16px 32px; border-top: 1px solid #E2E8F0;">
      <p style="color: #94A3B8; font-size: 0.75rem; margin: 0;">
        © {datetime.now().year} PRAGATI — Government of India Infrastructure Monitoring Platform
      </p>
    </div>
  </div>
</body>
</html>
"""


async def send_reset_email(to_email: str, user_name: str, reset_token: str) -> bool:
    """
    Send password reset email.
    Returns True if sent (or logged), False on error.

    When SMTP is not configured (EMAIL_ENABLED=False), prints the reset link
    to the console so development still works without an email provider.
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    if not settings.EMAIL_ENABLED or not settings.SMTP_USER:
        # Development fallback: log the reset link
        logger.warning("=" * 60)
        logger.warning("EMAIL NOT CONFIGURED — Password reset link (dev only):")
        logger.warning("  To:    %s", to_email)
        logger.warning("  Link:  %s", reset_link)
        logger.warning("=" * 60)
        print(f"\n[DEV] Password reset link for {to_email}:\n  {reset_link}\n")
        return True

    try:
        import aiosmtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText

        message = MIMEMultipart("alternative")
        message["Subject"] = "Reset your PRAGATI password"
        message["From"] = settings.SMTP_FROM
        message["To"] = to_email

        text_body = f"Hello {user_name},\n\nReset your password: {reset_link}\n\nLink expires in 60 minutes.\n"
        html_body = _build_reset_email_html(reset_link, user_name)

        message.attach(MIMEText(text_body, "plain"))
        message.attach(MIMEText(html_body, "html"))

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info("Password reset email sent to %s", to_email)
        return True

    except Exception as exc:
        logger.error("Failed to send reset email to %s: %s", to_email, exc)
        # Still log the link so dev doesn't get stuck
        logger.warning("Reset link (fallback): %s", reset_link)
        return False
