"""
Admin routes — Protected endpoints for managing projects, posts, and
interests.

Uses session tokens for auth: login issues a short-lived random token,
which the frontend sends as a Bearer token on subsequent requests.

Reads and writes flat-file JSON collections (backend/data/*.json) via the
datastore module. See datastore.py for how a save reaches GitHub so it
survives Vercel's read-only serverless filesystem and ships on the next
auto-deploy — in production, an edit here typically takes 30-60 seconds to
go live after this endpoint returns.
"""

import hmac
import re
import secrets
import time
from functools import wraps
from flask import Blueprint, jsonify, request
import datastore
from extensions import limiter
from services.s3 import upload_file
import config

admin_bp = Blueprint("admin", __name__)

# ---------------------------------------------------------------------------
# Session token store — maps token -> expiry timestamp (monotonic clock)
# ---------------------------------------------------------------------------

_tokens: dict = {}
_TOKEN_TTL = 8 * 3600  # 8 hours


def _issue_token() -> str:
    token = secrets.token_hex(32)
    _tokens[token] = time.monotonic() + _TOKEN_TTL
    return token


def _validate_token(token: str) -> bool:
    expiry = _tokens.get(token)
    if expiry is None:
        return False
    if time.monotonic() > expiry:
        del _tokens[token]
        return False
    return True


# ---------------------------------------------------------------------------
# Auth middleware
# ---------------------------------------------------------------------------

def require_admin(f):
    """Check the Authorization header for a valid session token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        if not _validate_token(auth[7:]):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated


def _save_or_502(name, data):
    """Persist a collection, turning a save failure into a clean 502 rather
    than an unhandled 500 — most commonly a missing/invalid GITHUB_TOKEN in
    production, or a GitHub API error."""
    try:
        datastore.save(name, data)
        return None
    except Exception as e:
        return jsonify({"error": f"Failed to save: {e}"}), 502


# ---------------------------------------------------------------------------
# Login — verify the admin password and issue a session token
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/login", methods=["POST"])
@limiter.limit("5 per 5 minutes")
def admin_login():
    """
    POST /api/admin/login
    Body: { "password": "..." }

    Returns a short-lived random session token on success.
    Rate-limited to 5 attempts per 5 minutes to prevent brute-force.
    """
    data = request.get_json()
    password = data.get("password", "") if data else ""
    if not hmac.compare_digest(password, config.ADMIN_PASSWORD):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({"message": "Authenticated", "token": _issue_token()})


# ---------------------------------------------------------------------------
# Projects CRUD
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/projects", methods=["GET"])
@require_admin
def list_projects():
    """GET /api/admin/projects — List all projects (including non-featured)."""
    projects = datastore.load("projects")
    projects.sort(key=lambda p: p.get("sort_order", 0))
    return jsonify(projects)


@admin_bp.route("/api/admin/projects", methods=["POST"])
@require_admin
def create_project():
    """
    POST /api/admin/projects
    Body: { "title": "...", "description": "...", "tech_stack": "...", ... }
    """
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    projects = datastore.load("projects")
    next_order = max((p.get("sort_order", 0) for p in projects), default=0) + 1

    project = {
        "id": datastore.next_id(projects),
        "title": data["title"],
        "description": data.get("description", ""),
        "tech_stack": data.get("tech_stack", ""),
        "live_url": data.get("live_url") or None,
        "github_url": data.get("github_url") or None,
        "image_url": data.get("image_url") or None,
        "featured": bool(data.get("featured", False)),
        "sort_order": next_order,
        "created_at": datastore.now_iso(),
        "tag_ids": data.get("tag_ids", []),
    }
    projects.append(project)

    if err := _save_or_502("projects", projects):
        return err

    return jsonify(project), 201


@admin_bp.route("/api/admin/projects/<int:project_id>", methods=["PUT"])
@require_admin
def update_project(project_id):
    """PUT /api/admin/projects/:id — Edit an existing project."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    projects = datastore.load("projects")
    project = next((p for p in projects if p["id"] == project_id), None)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    project.update({
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "tech_stack": data.get("tech_stack", ""),
        "live_url": data.get("live_url") or None,
        "github_url": data.get("github_url") or None,
        "image_url": data.get("image_url") or None,
        "featured": bool(data.get("featured", False)),
    })
    if "tag_ids" in data:
        project["tag_ids"] = data["tag_ids"]

    if err := _save_or_502("projects", projects):
        return err

    return jsonify(project)


@admin_bp.route("/api/admin/projects/<int:project_id>", methods=["DELETE"])
@require_admin
def delete_project(project_id):
    """DELETE /api/admin/projects/:id — Delete a project."""
    projects = datastore.load("projects")
    remaining = [p for p in projects if p["id"] != project_id]
    if len(remaining) == len(projects):
        return jsonify({"error": "Project not found"}), 404

    if err := _save_or_502("projects", remaining):
        return err

    return jsonify({"message": "Project deleted"})


@admin_bp.route("/api/admin/projects/reorder", methods=["PUT"])
@require_admin
def reorder_projects():
    """
    PUT /api/admin/projects/reorder
    Body: { "order": [id1, id2, id3, ...] }

    Updates sort_order for all projects based on the provided array index.
    """
    data = request.get_json()
    ordered_ids = data.get("order", []) if data else []
    if not ordered_ids:
        return jsonify({"error": "No order provided"}), 400

    projects = datastore.load("projects")
    order_index = {pid: i for i, pid in enumerate(ordered_ids, start=1)}
    for p in projects:
        if p["id"] in order_index:
            p["sort_order"] = order_index[p["id"]]

    if err := _save_or_502("projects", projects):
        return err

    return jsonify({"message": "Order updated"})


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _slugify(title: str) -> str:
    """Convert a title to a URL-safe slug."""
    slug = title.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)   # strip non-word chars (keep hyphens)
    slug = re.sub(r"[\s_]+", "-", slug)    # spaces/underscores → hyphens
    slug = re.sub(r"-+", "-", slug)        # collapse consecutive hyphens
    return slug.strip("-")


# ---------------------------------------------------------------------------
# Posts CRUD
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/posts", methods=["GET"])
@require_admin
def list_posts():
    """GET /api/admin/posts — List all posts (including drafts)."""
    posts = datastore.load("posts")
    posts.sort(key=lambda p: p.get("created_at", ""), reverse=True)
    return jsonify(posts)


@admin_bp.route("/api/admin/posts", methods=["POST"])
@require_admin
def create_post():
    """
    POST /api/admin/posts
    Body: { "title": "...", "content": "...", "slug": "...", "published": false }
    """
    data = request.get_json()
    if not data or not data.get("title") or not data.get("content"):
        return jsonify({"error": "Title and content are required"}), 400

    slug = data.get("slug") or _slugify(data["title"])
    posts = datastore.load("posts")

    if any(p.get("slug") == slug for p in posts):
        return jsonify({"error": "A post with that slug already exists"}), 409

    now = datastore.now_iso()
    post = {
        "id": datastore.next_id(posts),
        "title": data["title"],
        "content": data["content"],
        "slug": slug,
        "published": bool(data.get("published", False)),
        "created_at": now,
        "updated_at": now,
    }
    posts.append(post)

    if err := _save_or_502("posts", posts):
        return err

    return jsonify(post), 201


@admin_bp.route("/api/admin/posts/<int:post_id>", methods=["PUT"])
@require_admin
def update_post(post_id):
    """PUT /api/admin/posts/:id — Edit an existing post."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    posts = datastore.load("posts")
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    new_slug = data.get("slug") or post["slug"]
    if any(p.get("slug") == new_slug and p["id"] != post_id for p in posts):
        return jsonify({"error": "A post with that slug already exists"}), 409

    post.update({
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "slug": new_slug,
        "published": bool(data.get("published", False)),
        "updated_at": datastore.now_iso(),
    })

    if err := _save_or_502("posts", posts):
        return err

    return jsonify(post)


@admin_bp.route("/api/admin/posts/<int:post_id>", methods=["DELETE"])
@require_admin
def delete_post(post_id):
    """DELETE /api/admin/posts/:id — Delete a post."""
    posts = datastore.load("posts")
    remaining = [p for p in posts if p["id"] != post_id]
    if len(remaining) == len(posts):
        return jsonify({"error": "Post not found"}), 404

    if err := _save_or_502("posts", remaining):
        return err

    return jsonify({"message": "Post deleted"})


# ---------------------------------------------------------------------------
# Interests CRUD
# ---------------------------------------------------------------------------

_ALLOWED_THEMES = {"destiny2", "osu", "wakesurf", "geometrydash", "none"}


@admin_bp.route("/api/admin/interests", methods=["GET"])
@require_admin
def list_interests():
    """GET /api/admin/interests — List all interest cards in display order."""
    interests = datastore.load("interests")
    interests.sort(key=lambda i: (i.get("sort_order", 0), i.get("id", 0)))
    return jsonify(interests)


@admin_bp.route("/api/admin/interests", methods=["POST"])
@require_admin
def create_interest():
    """POST /api/admin/interests — Create a new interest card."""
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    theme = data.get("theme", "none")
    if theme not in _ALLOWED_THEMES:
        theme = "none"

    interests = datastore.load("interests")
    next_order = max((i.get("sort_order", 0) for i in interests), default=0) + 1

    interest = {
        "id": datastore.next_id(interests),
        "title": data["title"],
        "tag": data.get("tag", ""),
        "blurb": data.get("blurb", ""),
        "description": data.get("description", ""),
        "accent": data.get("accent", "#6fe7c1"),
        "theme": theme,
        "sort_order": data.get("sort_order") or next_order,
        "created_at": datastore.now_iso(),
    }
    interests.append(interest)

    if err := _save_or_502("interests", interests):
        return err

    return jsonify(interest), 201


@admin_bp.route("/api/admin/interests/<int:interest_id>", methods=["PUT"])
@require_admin
def update_interest(interest_id):
    """PUT /api/admin/interests/:id — Edit an existing interest card."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    theme = data.get("theme", "none")
    if theme not in _ALLOWED_THEMES:
        theme = "none"

    interests = datastore.load("interests")
    interest = next((i for i in interests if i["id"] == interest_id), None)
    if not interest:
        return jsonify({"error": "Interest not found"}), 404

    interest.update({
        "title": data.get("title", ""),
        "tag": data.get("tag", ""),
        "blurb": data.get("blurb", ""),
        "description": data.get("description", ""),
        "accent": data.get("accent", "#6fe7c1"),
        "theme": theme,
        "sort_order": data.get("sort_order", interest.get("sort_order", 0)),
    })

    if err := _save_or_502("interests", interests):
        return err

    return jsonify(interest)


@admin_bp.route("/api/admin/interests/<int:interest_id>", methods=["DELETE"])
@require_admin
def delete_interest(interest_id):
    """DELETE /api/admin/interests/:id — Delete an interest card."""
    interests = datastore.load("interests")
    remaining = [i for i in interests if i["id"] != interest_id]
    if len(remaining) == len(interests):
        return jsonify({"error": "Interest not found"}), 404

    if err := _save_or_502("interests", remaining):
        return err

    return jsonify({"message": "Interest deleted"})


# ---------------------------------------------------------------------------
# Image Upload (S3 Integration)
# ---------------------------------------------------------------------------

@admin_bp.route("/api/admin/upload", methods=["POST"])
@require_admin
def upload_image():
    """
    POST /api/admin/upload
    Body: multipart/form-data with a "file" field

    Uploads an image to S3 (or local storage in dev) and returns its URL.
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
