"""
Contact form route — Handles contact form submissions.

Sends an email notification via AWS SES (or logs it locally in dev).
Messages are not stored anywhere on the site — the email itself is the
only record, so a failed send is reported as an error rather than
silently swallowed.
"""

from flask import Blueprint, jsonify, request
from extensions import limiter
from services.email import send_contact_email

contact_bp = Blueprint("contact", __name__)

_MAX_NAME = 100
_MAX_EMAIL = 254   # RFC 5321 maximum
_MAX_MESSAGE = 5000


@contact_bp.route("/api/contact", methods=["POST"])
@limiter.limit("10 per hour")
def submit_contact():
    """
    POST /api/contact
    Body: { "name": "...", "email": "...", "message": "..." }
    """
    data = request.get_json()

    # Validate required fields
    if not data or not all(k in data for k in ("name", "email", "message")):
        return jsonify({"error": "Name, email, and message are required"}), 400

    name = data["name"].strip()
    email = data["email"].strip()
    message = data["message"].strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message cannot be empty"}), 400

    if len(name) > _MAX_NAME:
        return jsonify({"error": f"Name must be {_MAX_NAME} characters or fewer"}), 400
    if len(email) > _MAX_EMAIL:
        return jsonify({"error": f"Email must be {_MAX_EMAIL} characters or fewer"}), 400
    if len(message) > _MAX_MESSAGE:
        return jsonify({"error": f"Message must be {_MAX_MESSAGE} characters or fewer"}), 400

    # Email is the only place this message is recorded now, so a failed
    # send has to be a real error — not a message that quietly vanishes.
    try:
        send_contact_email(name, email, message)
    except Exception as e:
        print(f"Warning: Failed to send email notification: {e}")
        return jsonify({
            "error": "Sorry, something went wrong sending your message. Please try again in a moment."
        }), 502

    return jsonify({
        "message": "Thank you! Your message has been received.",
    }), 201
