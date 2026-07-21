"""
Interest routes — Public API endpoints for the Interests page.

All queries use raw SQL via psycopg2 to demonstrate SQL skills.
"""

from flask import Blueprint, jsonify
from db import get_db

interests_bp = Blueprint("interests", __name__)


@interests_bp.route("/api/interests", methods=["GET"])
def get_interests():
    """
    GET /api/interests

    Demonstrates: SELECT + ORDER BY
    Purpose: Fetch the interest cards in display order for the public page.
    """
    with get_db() as (conn, cur):
        cur.execute("""
            SELECT id, title, tag, blurb, description, accent, theme, sort_order
            FROM interests
            ORDER BY sort_order ASC, id ASC
        """)
        interests = cur.fetchall()

    return jsonify(interests)
