"""
Contact form route — Handles contact form submissions.

Stores the message in the database AND sends an email notification
via AWS SES (or logs it locally in development).
"""

from flask import Blueprint, jsonify, request
from db import get_db
from services.email import send_contact_email

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/api/contact", methods=["POST"])
def submit_contact():
    """
    POST /api/contact
    Body: { "name": "...", "email": "...", "message": "..." }

    Demonstrates: INSERT with parameterized values + AWS SES integration
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

    # Store the message in the database
    with get_db() as (conn, cur):
        # -- Demonstrates: INSERT with RETURNING
        # -- Purpose: Save a contact form submission to the database
        cur.execute("""
            INSERT INTO contact_messages (name, email, message)
            VALUES (%s, %s, %s)
            RETURNING id, created_at
        """, (name, email, message))

        result = cur.fetchone()

    # Send email notification via SES (or log it locally)
    try:
        send_contact_email(name, email, message)
    except Exception as e:
        # Don't fail the request if email sending fails —
        # the message is already saved in the database
        print(f"Warning: Failed to send email notification: {e}")

    return jsonify({
        "message": "Thank you! Your message has been received.",
        "id": result["id"],
    }), 201
