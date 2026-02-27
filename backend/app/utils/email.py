import logging
import smtplib
from email.message import EmailMessage
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)

async def send_email_notification(
    to_email: str,
    subject: str,
    body: str,
    html: Optional[str] = None
):
    """
    Utility for sending emails securely utilizing SMTP credentials from .env.
    """
    # Still print for debugging purposes in case SMTP fails
    print(f"\n" + "="*50)
    print(f"[MAIL] EMAIL PREPARED FOR: {to_email}")
    print(f"[SUBJ] SUBJECT: {subject}")
    print(f"[BODY] BODY:\n{body}")
    print("="*50 + "\n")
    
    settings = get_settings()
    host = settings.SMTP_HOST or "smtp.gmail.com"
    port = settings.SMTP_PORT
    user = settings.SMTP_EMAIL
    password = settings.SMTP_PASSWORD
    
    if not user or not password:
        logger.warning(f"SMTP credentials missing. Mocked email to {to_email} only.")
        return True
        
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = f"MusB Research <{user}>"
        msg["To"] = to_email
        msg.set_content(body)
        
        if html:
            msg.add_alternative(html, subtype="html")
            
        with smtplib.SMTP(host, port) as server:
            if port == 587:
                 server.starttls()
            server.login(str(user), str(password))
            server.send_message(msg)
            
        logger.info(f"Notification email successfully dispatched to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        # We return True anyway to not block the main workflow, but logs capture the error
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

async def notify_admin_new_study_inquiry(
    admin_email: str,
    sponsor_name: str,
    sponsor_email: str,
    study_details: dict
):
    """Helper to notify admin about a new study inquiry from a sponsor."""
    subject = f"MUSB Portal: New Study Inquiry - {study_details.get('title')}"
    
    # Create a nice summary of details
    details_text = "\n".join([f"• {k}: {v}" for k, v in study_details.items() if v and k not in ('description', 'inclusionCriteria', 'exclusionCriteria', 'slug')])
    
    body = f"""
    Hello Admin,
    
    A new study inquiry has been submitted by a sponsor.
    
    SPONSOR DETAILS:
    Name: {sponsor_name}
    Email: {sponsor_email}
    
    STUDY OVERVIEW:
    {details_text}
    
    DESCRIPTION:
    {study_details.get('description', 'No description provided.')[:500]}...
    
    This study is currently marked as 'UNDER_REVIEW'. Please log in to the admin dashboard 
    to carefully check the details and allow the launch if everything is correct.
    
    Best regards,
    MUSB Research System
    """
    
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #0d9488;">New Study Inquiry Submitted</h2>
        <p>A sponsor wants to launch a new study on the platform.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #64748b;">Sponsor Contact</h3>
            <p style="margin-bottom: 4px;"><strong>Name:</strong> {sponsor_name}</p>
            <p style="margin-top: 0;"><strong>Email:</strong> {sponsor_email}</p>
        </div>
        
        <div style="background-color: #f0fdfa; padding: 16px; border-radius: 8px; border-left: 4px solid #0d9488;">
            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #0d9488;">Study: {study_details.get('title')}</h3>
            <p><strong>Condition:</strong> {study_details.get('condition')}</p>
            <p><strong>Target Participants:</strong> {study_details.get('targetParticipants')}</p>
            <p><strong>Compensation:</strong> {study_details.get('compensationAmount')} {study_details.get('compensationDescription')}</p>
        </div>
        
        <p style="margin-top: 24px;">Please review this study in the Admin Dashboard to approve the launch.</p>
        
        <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; pt: 16px; font-size: 12px; color: #94a3b8;">
            Sent via MUSB Research Automated Notification System
        </div>
    </div>
    """
    
    settings = get_settings()
    await send_email_notification(admin_email, subject, body, html=html)
