import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.config import settings


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """Send password reset email. Returns True if sent, False otherwise."""
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        # If SMTP not configured, log to console for development
        if settings.DEBUG:
            print("\n" + "="*60)
            print("PASSWORD RESET EMAIL (DEV MODE - NO SMTP CONFIGURED)")
            print("="*60)
            print(f"To: {to_email}")
            print(f"Subject: Reset your Story Store password")
            print(f"\nReset Link: {reset_link}")
            print("="*60 + "\n")
            return True
        # If SMTP not configured in production, fall back to not sending
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Reset your Story Store password'
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = to_email

        text = f"""Hello,

You requested to reset your password for Story Store.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

- Story Store Team
"""
        html = f"""<html>
  <body>
    <p>Hello,</p>
    <p>You requested to reset your password for Story Store.</p>
    <p><a href="{reset_link}">Click here to reset your password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>- Story Store Team</p>
  </body>
</html>
"""
        msg.attach(MIMEText(text, 'plain'))
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        return True
    except Exception:
        return False
