"""
Interest routes — Public API endpoints for the Interests page.

Reads from the flat-file JSON store (backend/data/interests.json).
"""

from flask import Blueprint, jsonify
import datastore

interests_bp = Blueprint("interests", __name__)


@interests_bp.route("/api/interests", methods=["GET"])
def get_interests():
    """GET /api/interests — interest cards in display order."""
    interests = datastore.load("interests")
    interests = sorted(
        interests, key=lambda i: (i.get("sort_order", 0), i.get("id", 0))
    )
    return jsonify(interests)
