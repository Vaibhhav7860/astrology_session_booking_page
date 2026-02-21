import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "intothestar1009@gmail.com")
SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD", "")

FROM_EMAIL = SMTP_EMAIL
ADMIN_EMAIL = "intothestar1009@gmail.com"

def _send_email(to_email: str, subject: str, html_content: str):
    if not SMTP_APP_PASSWORD:
        print("SMTP_APP_PASSWORD not set. Mocking email send.")
        print(f"To: {to_email}\nSubject: {subject}\n{html_content}")
        return

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = formataddr(("INTO THE STAR", FROM_EMAIL))
    msg['To'] = to_email
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.send_message(msg)
            print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Error sending email to {to_email}: {e}")

def send_booking_confirmation_email(user_email: str, first_name: str, session_date: str, session_time: str, time_zone: str):
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Dear {first_name},</p>
        <p>Hoping an amazing experience for the session.</p>
        <p>Your session is confirmed for <strong>{session_date} at {session_time} ({time_zone})</strong>.</p>
        <p>Please note: Be on time for the session to make the most out of your reading.</p>
        <br>
        <p>Warm regards,<br>INTO THE STAR Team</p>
    </body>
    </html>
    """
    _send_email(user_email, "Session Booking Confirmation - INTO THE STAR", html_content)

def send_admin_alert_email(booking_details: dict):
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h3>New Booking Received!</h3>
        <p><strong>Name:</strong> {booking_details.get('first_name')} {booking_details.get('last_name')}</p>
        <p><strong>Email:</strong> {booking_details.get('email')}</p>
        <p><strong>Session:</strong> {booking_details.get('session_date')} at {booking_details.get('session_time')} ({booking_details.get('time_zone')})</p>
        <p><strong>Amount Paid:</strong> {booking_details.get('amount_paid')} {booking_details.get('currency_paid')}</p>
    </body>
    </html>
    """
    _send_email(ADMIN_EMAIL, "New Session Booking Alert", html_content)
