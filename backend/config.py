"""
Application configuration.

Reads settings from environment variables with sensible defaults
for local development. See .env.example in the project root.
"""

import os
from dotenv import load_dotenv

load_dotenv()


# --- Database (PostgreSQL via AWS RDS or local) ---
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "portfolio")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

# --- AWS General ---
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# --- AWS S3 (for project images) ---
S3_BUCKET = os.getenv("S3_BUCKET", "portfolio-images-dev")
# When running locally without AWS, we store uploads in a local directory
USE_LOCAL_STORAGE = os.getenv("USE_LOCAL_STORAGE", "true").lower() == "true"
LOCAL_UPLOAD_DIR = os.getenv("LOCAL_UPLOAD_DIR", "uploads")

# --- AWS SES (for contact form emails) ---
SES_SENDER_EMAIL = os.getenv("SES_SENDER_EMAIL", "noreply@example.com")
SES_RECIPIENT_EMAIL = os.getenv("SES_RECIPIENT_EMAIL", "your-email@example.com")
# When running locally without AWS, we just log the email instead of sending
USE_LOCAL_EMAIL = os.getenv("USE_LOCAL_EMAIL", "true").lower() == "true"

# --- Admin Auth (simple password for demo purposes) ---
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# --- Flask ---
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
