from __future__ import annotations

from abc import ABC, abstractmethod


class EmailSender(ABC):
    """Abstract interface for sending transactional emails.

    Implement this in your project to connect to your email provider.

    Example (SMTP):

        import smtplib
        from email.message import EmailMessage

        class SMTPEmailSender(EmailSender):
            async def send_reset_email(self, to: str, token: str, reset_url: str) -> None:
                msg = EmailMessage()
                msg["Subject"] = "Reset your password"
                msg["From"] = "noreply@yourapp.com"
                msg["To"] = to
                msg.set_content(f"Click here to reset your password: {reset_url}")
                with smtplib.SMTP("localhost") as smtp:
                    smtp.send_message(msg)

    Then register it in QuiverConfig:

        config = QuiverConfig(email_sender=SMTPEmailSender())
        QuiverApp(app, config=config)
    """

    @abstractmethod
    async def send_reset_email(self, to: str, token: str, reset_url: str) -> None:
        """Send a password-reset email.

        Args:
            to: Recipient email address.
            token: The plain reset token (already embedded in reset_url).
            reset_url: Full URL the user should visit to reset their password.
        """
