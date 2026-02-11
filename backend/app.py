"""
Portfolio Website — Flask Backend

A simple REST API that serves portfolio data from a PostgreSQL database.
Demonstrates raw SQL queries, AWS S3 integration, and AWS SES integration.

Run locally:
    pip install -r requirements.txt
    python app.py
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from routes.projects import projects_bp
from routes.posts import posts_bp
from routes.contact import contact_bp
from routes.admin import admin_bp
import config

app = Flask(__name__)
app.secret_key = config.SECRET_KEY

# Allow requests from the React dev server (localhost:3000)
CORS(app)

# Register route blueprints
app.register_blueprint(projects_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(contact_bp)
app.register_blueprint(admin_bp)


# Serve locally uploaded files during development
@app.route("/uploads/<filename>")
def serve_upload(filename):
    """Serve files from the local uploads directory (dev only)."""
    return send_from_directory(config.LOCAL_UPLOAD_DIR, filename)


@app.route("/api/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    # Create local upload directory if it doesn't exist
    os.makedirs(config.LOCAL_UPLOAD_DIR, exist_ok=True)
    app.run(debug=True, port=5000)
