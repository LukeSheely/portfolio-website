"""
Blog post routes — Public API endpoints for blog posts.

Reads from the flat-file JSON store (backend/data/posts.json).
"""

from flask import Blueprint, jsonify
import datastore

posts_bp = Blueprint("posts", __name__)


@posts_bp.route("/api/posts", methods=["GET"])
def get_posts():
    """
    GET /api/posts

    Published posts only (drafts are hidden), newest first.
    """
    posts = datastore.load("posts")
    published = [p for p in posts if p.get("published")]
    published.sort(key=lambda p: p.get("created_at", ""), reverse=True)

    result = [{k: v for k, v in p.items() if k != "content"} for p in published]
    return jsonify(result)


@posts_bp.route("/api/posts/<slug>", methods=["GET"])
def get_post(slug):
    """GET /api/posts/:slug — a single published post."""
    posts = datastore.load("posts")
    post = next(
        (p for p in posts if p.get("slug") == slug and p.get("published")), None
    )

    if not post:
        return jsonify({"error": "Post not found"}), 404

    return jsonify(post)
