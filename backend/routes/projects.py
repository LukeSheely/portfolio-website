"""
Project routes — Public API endpoints for portfolio projects.

All queries use raw SQL via psycopg2 to demonstrate SQL skills.
"""

from flask import Blueprint, jsonify, request
from db import get_db

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/api/projects", methods=["GET"])
def get_projects():
    """
    GET /api/projects
    Optional query param: ?featured=true to filter featured projects only.

    Demonstrates: SELECT with optional WHERE clause + ORDER BY
    """
    featured = request.args.get("featured")

    with get_db() as (conn, cur):
        if featured == "true":
            # -- Demonstrates: WHERE + ORDER BY
            # -- Purpose: Fetch featured projects for the homepage
            cur.execute("""
                SELECT id, title, description, tech_stack,
                       live_url, github_url, image_url, featured, created_at
                FROM projects
                WHERE featured = TRUE
                ORDER BY created_at DESC
            """)
        else:
            cur.execute("""
                SELECT id, title, description, tech_stack,
                       live_url, github_url, image_url, featured, created_at
                FROM projects
                ORDER BY created_at DESC
            """)

        projects = cur.fetchall()

    return jsonify(projects)


@projects_bp.route("/api/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    """
    GET /api/projects/:id

    Demonstrates: JOIN across three tables (projects, project_tags, tags)
    to resolve a many-to-many relationship.
    """
    with get_db() as (conn, cur):
        # -- Demonstrates: LEFT JOIN + json_agg for many-to-many
        # -- Purpose: Fetch a single project with its tags
        cur.execute("""
            SELECT
                p.id, p.title, p.description, p.tech_stack,
                p.live_url, p.github_url, p.image_url, p.featured, p.created_at,
                COALESCE(
                    json_agg(json_build_object('id', t.id, 'name', t.name))
                    FILTER (WHERE t.id IS NOT NULL),
                    '[]'
                ) AS tags
            FROM projects p
            LEFT JOIN project_tags pt ON p.id = pt.project_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            WHERE p.id = %s
            GROUP BY p.id
        """, (project_id,))

        project = cur.fetchone()

    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify(project)


@projects_bp.route("/api/tags", methods=["GET"])
def get_tags():
    """
    GET /api/tags

    Demonstrates: COUNT aggregate + GROUP BY + JOIN
    Purpose: Get all tags with their project count (for a tag cloud).
    """
    with get_db() as (conn, cur):
        # -- Demonstrates: Aggregate function with GROUP BY
        # -- Purpose: Build a tag cloud showing how many projects use each tag
        cur.execute("""
            SELECT
                t.id,
                t.name,
                COUNT(pt.project_id) AS project_count
            FROM tags t
            LEFT JOIN project_tags pt ON t.id = pt.tag_id
            GROUP BY t.id, t.name
            ORDER BY project_count DESC
        """)

        tags = cur.fetchall()

    return jsonify(tags)
