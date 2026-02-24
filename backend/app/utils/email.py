import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

async def send_email_notification(
    to_email: str,
    subject: str,
    body: str,
    html: Optional[str] = None
):
    """
    Mock utility for sending emails. 
    In production, this would use SendGrid, AWS SES, or an SMTP server.
    """
    # MOCK LOGIC: Print to console and log
    print(f"\n" + "="*50)
    print(f"📧 EMAIL SENT TO: {to_email}")
    print(f"📑 SUBJECT: {subject}")
    print(f"📝 BODY: {body}")
    print("="*50 + "\n")
    
    logger.info(f"Notification email sent to {to_email}")
    return True

async def notify_coordinator_new_message(
    coordinator_email: str,
    coordinator_name: str,
    participant_name: str,
    message_excerpt: str
):
    """Helper to notify a coordinator about a new participant message."""
    subject = f"MUSB Portal: New message from {participant_name}"
    body = f"""
    Hello {coordinator_name},
    
    Participant {participant_name} has sent you a new message on the MUSB Portal:
    
    "{message_excerpt}..."
    
    Please log in to your coordinator dashboard to reply and maintain protocol adherence.
    
    Best regards,
    MUSB Research System
    """
    await send_email_notification(coordinator_email, subject, body)
