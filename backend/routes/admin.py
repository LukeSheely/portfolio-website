"""
Admin routes — Protected endpoints for managing projects, posts, and messages.

Uses a simple password-based auth check for demo purposes.
In production, you'd use JWT tokens or session-based auth.
"""

from functools import wraps
from flask import Blueprint, jsonify, request
from db import get_db
from services.s3 import upload_file
import config

admin_bp = Blueprint("admin", __name__)


# ---------------------------------------------------------------------------
# Auth middleware — simple password check for demo purposes
# ---------------------------------------------------------------------------

def require_admin(f):
    """Check the Authorization header for the admin password."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if auth != f"Bearer {config.ADMIN_PASSWORD}":
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


# ---------------------------------------------------------------------------
# Login — verify the admin password
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/login", methods=["POST"])
def admin_login():
    """
    POST /api/admin/login
    Body: { "password": "..." }

    Returns a success status if the password matches.
    The frontend stores the password and sends it with subsequent requests.
    """
    data = request.get_json()
    if not data or data.get("password") != config.ADMIN_PASSWORD:
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({"message": "Authenticated", "token": config.ADMIN_PASSWORD})


# ---------------------------------------------------------------------------
# Projects CRUD
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/projects", methods=["GET"])
@require_admin
def list_projects():
    """GET /api/admin/projects — List all projects (including non-featured)."""
    with get_db() as (conn, cur):
        cur.execute("""
            SELECT id, title, description, tech_stack,
                   live_url, github_url, image_url, featured, created_at
            FROM projects
            ORDER BY created_at DESC
        """)
        projects = cur.fetchall()
    return jsonify(projects)


@admin_bp.route("/api/admin/projects", methods=["POST"])
@require_admin
def create_project():
    """
    POST /api/admin/projects
    Body: { "title": "...", "description": "...", "tech_stack": "...", ... }

    Demonstrates: INSERT with RETURNING + transaction for related data
    """
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    with get_db() as (conn, cur):
        # -- Demonstrates: INSERT with RETURNING
        # -- Purpose: Create a new portfolio project
        cur.execute("""
            INSERT INTO projects (title, description, tech_stack, live_url, github_url, image_url, featured)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, title, created_at
        """, (
            data["title"],
            data.get("description", ""),
            data.get("tech_stack", ""),
            data.get("live_url"),
            data.get("github_url"),
            data.get("image_url"),
            data.get("featured", False),
        ))
        project = cur.fetchone()

        # If tags were provided, link them to the project
        tag_ids = data.get("tag_ids", [])
        for tag_id in tag_ids:
            # -- Demonstrates: INSERT into junction table (many-to-many)
            cur.execute("""
                INSERT INTO project_tags (project_id, tag_id)
                VALUES (%s, %s)
            """, (project["id"], tag_id))

    return jsonify(project), 201


@admin_bp.route("/api/admin/projects/<int:project_id>", methods=["PUT"])
@require_admin
def update_project(project_id):
    """
    PUT /api/admin/projects/:id

    Demonstrates: UPDATE with WHERE + RETURNING
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    with get_db() as (conn, cur):
        # -- Demonstrates: UPDATE with RETURNING
        # -- Purpose: Edit an existing portfolio project
        cur.execute("""
            UPDATE projects
            SET title = %s,
                description = %s,
                tech_stack = %s,
                live_url = %s,
                github_url = %s,
                image_url = %s,
                featured = %s
            WHERE id = %s
            RETURNING id, title, created_at
        """, (
            data.get("title", ""),
            data.get("description", ""),
            data.get("tech_stack", ""),
            data.get("live_url"),
            data.get("github_url"),
            data.get("image_url"),
            data.get("featured", False),
            project_id,
        ))
        project = cur.fetchone()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify(project)


@admin_bp.route("/api/admin/projects/<int:project_id>", methods=["DELETE"])
@require_admin
def delete_project(project_id):
    """DELETE /api/admin/projects/:id — Delete a project."""
    with get_db() as (conn, cur):
        cur.execute("DELETE FROM projects WHERE id = %s RETURNING id", (project_id,))
        deleted = cur.fetchone()

    if not deleted:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({"message": "Project deleted"})


# ---------------------------------------------------------------------------
# Posts CRUD
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/posts", methods=["GET"])
@require_admin
def list_posts():
    """GET /api/admin/posts — List all posts (including drafts)."""
    with get_db() as (conn, cur):
        cur.execute("""
            SELECT id, title, slug, published, created_at, updated_at
            FROM posts
            ORDER BY created_at DESC
        """)
        posts = cur.fetchall()
    return jsonify(posts)


@admin_bp.route("/api/admin/posts", methods=["POST"])
@require_admin
def create_post():
    """
    POST /api/admin/posts
    Body: { "title": "...", "content": "...", "slug": "...", "published": false }

    Demonstrates: INSERT with slug for SEO-friendly URLs
    """
    data = request.get_json()
    if not data or not data.get("title") or not data.get("content"):
        return jsonify({"error": "Title and content are required"}), 400

    # Generate slug from title if not provided
    slug = data.get("slug") or data["title"].lower().replace(" ", "-")

    with get_db() as (conn, cur):
        cur.execute("""
            INSERT INTO posts (title, content, slug, published)
            VALUES (%s, %s, %s, %s)
            RETURNING id, title, slug, created_at
        """, (
            data["title"],
            data["content"],
            slug,
            data.get("published", False),
        ))
        post = cur.fetchone()

    return jsonify(post), 201


@admin_bp.route("/api/admin/posts/<int:post_id>", methods=["PUT"])
@require_admin
def update_post(post_id):
    """PUT /api/admin/posts/:id — Edit an existing post."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    with get_db() as (conn, cur):
        cur.execute("""
            UPDATE posts
            SET title = %s,
                content = %s,
                slug = %s,
                published = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, title, slug, updated_at
        """, (
            data.get("title", ""),
            data.get("content", ""),
            data.get("slug", ""),
            data.get("published", False),
            post_id,
        ))
        post = cur.fetchone()

    if not post:
        return jsonify({"error": "Post not found"}), 404

    return jsonify(post)


@admin_bp.route("/api/admin/posts/<int:post_id>", methods=["DELETE"])
@require_admin
def delete_post(post_id):
    """DELETE /api/admin/posts/:id — Delete a post."""
    with get_db() as (conn, cur):
        cur.execute("DELETE FROM posts WHERE id = %s RETURNING id", (post_id,))
        deleted = cur.fetchone()

    if not deleted:
        return jsonify({"error": "Post not found"}), 404

    return jsonify({"message": "Post deleted"})


# ---------------------------------------------------------------------------
# Contact Messages
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/messages", methods=["GET"])
@require_admin
def list_messages():
    """GET /api/admin/messages — List all contact form submissions."""
    with get_db() as (conn, cur):
        cur.execute("""
            SELECT id, name, email, message, created_at
            FROM contact_messages
            ORDER BY created_at DESC
        """)
        messages = cur.fetchall()
    return jsonify(messages)


@admin_bp.route("/api/admin/messages/<int:message_id>", methods=["DELETE"])
@require_admin
def delete_message(message_id):
    """
    DELETE /api/admin/messages/:id

    Demonstrates: DELETE with WHERE clause
    """
    with get_db() as (conn, cur):
        # -- Demonstrates: DELETE with WHERE + RETURNING
        # -- Purpose: Remove a contact message after reading it
        cur.execute("""
            DELETE FROM contact_messages
            WHERE id = %s
            RETURNING id
        """, (message_id,))
        deleted = cur.fetchone()

    if not deleted:
        return jsonify({"error": "Message not found"}), 404

    return jsonify({"message": "Message deleted"})


# ---------------------------------------------------------------------------
# Image Upload (S3 Integration)
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/upload", methods=["POST"])
@require_admin
def upload_image():
    """
    POST /api/admin/upload
    Body: multipart/form-data with a "file" field

    Demonstrates: AWS S3 integration for file storage.
    Uploads an image and returns its URL.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        url = upload_file(file)
        return jsonify({"url": url}), 201
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500
