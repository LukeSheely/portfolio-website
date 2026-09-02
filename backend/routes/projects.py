"""
Project routes — Public API endpoints for portfolio projects.

Reads from the flat-file JSON store (backend/data/projects.json and
backend/data/tags.json) instead of a database.
"""

from flask import Blueprint, jsonify, request
import datastore

projects_bp = Blueprint("projects", __name__)


def _tags_by_id():
    return {t["id"]: t for t in datastore.load("tags")}


@projects_bp.route("/api/projects", methods=["GET"])
def get_projects():
    """
    GET /api/projects
    Optional query param: ?featured=true to filter featured projects only.
    """
    featured = request.args.get("featured")
    projects = datastore.load("projects")

    if featured == "true":
        projects = [p for p in projects if p.get("featured")]

    projects = sorted(projects, key=lambda p: p.get("sort_order", 0))

    # Match the old column list: don't leak tag_ids on the list view.
    result = [{k: v for k, v in p.items() if k != "tag_ids"} for p in projects]
    return jsonify(result)


@projects_bp.route("/api/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    """GET /api/projects/:id — a single project with its resolved tags."""
    projects = datastore.load("projects")
    project = next((p for p in projects if p["id"] == project_id), None)

    if not project:
        return jsonify({"error": "Project not found"}), 404

    tags_by_id = _tags_by_id()
    tags = [
        {"id": tid, "name": tags_by_id[tid]["name"]}
        for tid in project.get("tag_ids", [])
        if tid in tags_by_id
    ]

    result = {k: v for k, v in project.items() if k != "tag_ids"}
    result["tags"] = tags
    return jsonify(result)


@projects_bp.route("/api/tags", methods=["GET"])
def get_tags():
    """
    GET /api/tags

    All tags with a computed project count (for a tag cloud), busiest
    tags first.
    """
    tags = datastore.load("tags")
    projects = datastore.load("projects")

    counts = {}
    for p in projects:
        for tid in p.get("tag_ids", []):
            counts[tid] = counts.get(tid, 0) + 1

    result = [
        {"id": t["id"], "name": t["name"], "project_count": counts.get(t["id"], 0)}
        for t in tags
    ]
    result.sort(key=lambda t: t["project_count"], reverse=True)
    return jsonify(result)
