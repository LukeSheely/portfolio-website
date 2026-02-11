"""
AWS SES Integration — Email Service

What it does:
    SES (Simple Email Service) sends emails programmatically. We use it to
    forward contact form submissions to your personal email.

Why it's used here:
    - Serverless email sending (no mail server to manage)
    - Pay-per-email pricing (essentially free at low volume)
    - Demonstrates AWS SDK (boto3) integration

How to set it up:
    1. Go to AWS Console > SES > Verified Identities
    2. Click "Create Identity" and verify your email address
       (you'll receive a confirmation email — click the link)
    3. While in SES sandbox mode, you can only send TO verified addresses.
       For production, request "Production Access" to send to any address.
    4. Set SES_SENDER_EMAIL, SES_RECIPIENT_EMAIL, and USE_LOCAL_EMAIL=false
       in your .env file
    5. Ensure your AWS credentials are configured (aws configure or IAM role)

Local development:
    When USE_LOCAL_EMAIL=true (default), emails are logged to the console
    instead of being sent via SES. No AWS account needed for development.
"""

import boto3
import config


def send_contact_email(name, email, message):
    """
    Send a contact form submission via SES (or log it in dev mode).

    Args:
        name: The sender's name
        email: The sender's email address
        message: The message body

    Returns:
        True if the email was sent (or logged) successfully
    """
    if config.USE_LOCAL_EMAIL:
        return _log_email(name, email, message)
    else:
        return _send_via_ses(name, email, message)


def _log_email(name, email, message):
    """Log the email to console instead of sending (for development)."""
    print("=" * 60)
    print("LOCAL EMAIL (not sent — set USE_LOCAL_EMAIL=false to send via SES)")
    print(f"  From: {name} <{email}>")
    print(f"  To: {config.SES_RECIPIENT_EMAIL}")
    print(f"  Message: {message}")
    print("=" * 60)
    return True


def _send_via_ses(name, email, message):
    """Send the contact form email via AWS SES."""
    ses_client = boto3.client("ses", region_name=config.AWS_REGION)

    subject = f"Portfolio Contact: Message from {name}"
    body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"

    ses_client.send_email(
        Source=config.SES_SENDER_EMAIL,
        Destination={"ToAddresses": [config.SES_RECIPIENT_EMAIL]},
        Message={
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body": {"Text": {"Data": body, "Charset": "UTF-8"}},
        },
    )

    return True
