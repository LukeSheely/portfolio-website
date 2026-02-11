"""
Blog post routes — Public API endpoints for blog posts.

All queries use raw SQL via psycopg2 to demonstrate SQL skills.
"""

from flask import Blueprint, jsonify
from db import get_db

posts_bp = Blueprint("posts", __name__)


@posts_bp.route("/api/posts", methods=["GET"])
def get_posts():
    """
    GET /api/posts

    Demonstrates: Basic SELECT with WHERE clause
    Purpose: Fetch all published blog posts for the public blog page.
    Only published posts are returned (drafts are hidden).
    """
    with get_db() as (conn, cur):
        # -- Demonstrates: SELECT + WHERE + ORDER BY
        # -- Purpose: Fetch published posts, newest first
        cur.execute("""
            SELECT id, title, slug, created_at, updated_at
            FROM posts
            WHERE published = TRUE
            ORDER BY created_at DESC
        """)

        posts = cur.fetchall()

    return jsonify(posts)


@posts_bp.route("/api/posts/<slug>", methods=["GET"])
def get_post(slug):
    """
    GET /api/posts/:slug

    Demonstrates: Parameterized query for SQL injection prevention.
    The slug comes from the URL, so it's user input that must be sanitized.
    Using %s placeholder ensures psycopg2 escapes the value safely.
    """
    with get_db() as (conn, cur):
        # -- Demonstrates: Parameterized query (SQL injection prevention)
        # -- Purpose: Safely fetch a single post by its URL slug
        cur.execute("""
            SELECT id, title, content, slug, published, created_at, updated_at
            FROM posts
            WHERE slug = %s AND published = TRUE
        """, (slug,))

        post = cur.fetchone()

    if not post:
        return jsonify({"error": "Post not found"}), 404

    return jsonify(post)
