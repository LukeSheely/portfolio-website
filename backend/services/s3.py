"""
AWS S3 Integration — File Storage Service

What it does:
    S3 (Simple Storage Service) stores and serves files (images, documents, etc.)
    in the cloud. We use it to store project screenshots uploaded via the admin page.

Why it's used here:
    - Offloads file storage from the web server
    - Serves images via a CDN-friendly URL
    - Demonstrates AWS SDK (boto3) usage

How to set it up:
    1. Go to AWS Console > S3 > Create Bucket
    2. Name your bucket (e.g. "portfolio-images-yourname")
    3. Uncheck "Block all public access" (we need images to be publicly readable)
    4. Add a bucket policy to allow public reads:
       {
         "Version": "2012-10-17",
         "Statement": [{
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
         }]
       }
    5. Set S3_BUCKET and USE_LOCAL_STORAGE=false in your .env file
    6. Ensure your AWS credentials are configured (aws configure or IAM role)

Local development:
    When USE_LOCAL_STORAGE=true (default), files are saved to a local
    directory instead of S3. No AWS account needed for development.
"""

import os
import uuid
import boto3
from werkzeug.utils import secure_filename
import config


def upload_file(file):
    """
    Upload a file to S3 (or local storage in dev mode).

    Args:
        file: A Flask FileStorage object from a form upload

    Returns:
        The public URL where the file can be accessed
    """
    # Generate a unique filename to avoid collisions
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filename = secure_filename(filename)

    if config.USE_LOCAL_STORAGE:
        return _save_locally(file, filename)
    else:
        return _upload_to_s3(file, filename)


def _save_locally(file, filename):
    """Save file to local uploads directory (for development)."""
    upload_dir = config.LOCAL_UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    # Return a local URL that Flask can serve
    return f"/uploads/{filename}"


def _upload_to_s3(file, filename):
    """Upload file to AWS S3 and return the public URL."""
    s3_client = boto3.client("s3", region_name=config.AWS_REGION)

    s3_client.upload_fileobj(
        file,
        config.S3_BUCKET,
        filename,
        ExtraArgs={
            "ContentType": file.content_type,
        },
    )

    # Return the public S3 URL
    return f"https://{config.S3_BUCKET}.s3.{config.AWS_REGION}.amazonaws.com/{filename}"
