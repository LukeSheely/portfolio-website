# AWS Setup Guide

This guide documents the AWS services integrated with your portfolio website.

## Current Architecture

✅ **Database:** Supabase (free PostgreSQL)
✅ **Backend:** Render (free Flask hosting)
✅ **Frontend:** Netlify (free React hosting)
✅ **Storage:** AWS S3 (us-east-2) — ~$0.50/month

## AWS Services

This codebase includes production-ready integration code for:

- **S3** — ✅ **ACTIVE** — Project images stored in S3 (us-east-2)
- **SES** — ✅ **ACTIVE** — Contact form email notifications (us-east-1)

Both S3 and SES are currently deployed and working in production.

---

## Prerequisites

- An AWS account ([sign up here](https://aws.amazon.com/free/))
- AWS CLI installed and configured (`aws configure`)

---

## 1. S3 — Image Storage ✅ ACTIVE

**What it does:** S3 (Simple Storage Service) stores files (images, documents, etc.) in the cloud with high durability and availability. Files are accessible via URLs.

**Current setup:** ✅ Active with bucket `portfolio-images-lukesheely` in `us-east-2`

**Why it's used here:** We store project screenshots uploaded through the admin page. S3 serves them directly to visitors via public URLs.

### Current Configuration

**Bucket:** `portfolio-images-lukesheely`
**Region:** `us-east-2`
**Access:** Public read access with CORS configured
**Cost:** ~$0.50/month for storage

### Setup Steps (Already Completed)

1. Created S3 bucket in us-east-2
2. Disabled "Block all public access"
3. Added bucket policy for public GetObject:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::portfolio-images-lukesheely/*"
    }
  ]
}
```

4. Configured CORS to allow frontend access:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": [
            "https://lukesheely.netlify.app",
            "http://localhost:5173"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

5. Created IAM user `portfolio-app` with S3 access
6. Generated access keys and added to Render environment variables

### Environment Variables (Production)

```
AWS_REGION=us-east-2
S3_BUCKET=portfolio-images-lukesheely
USE_LOCAL_STORAGE=false
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

### For Local Development

Set `USE_LOCAL_STORAGE=true` in your `.env` file to save images locally without needing AWS credentials.

---

## 2. SES — Email Notifications ✅ ACTIVE

**What it does:** SES (Simple Email Service) sends emails programmatically. We use it to send yourself an email whenever someone submits the contact form.

**Current setup:** ✅ Active — Sending notifications to sheelyl2@wwu.edu

**Why it's used:** Instead of checking the database for new contact messages, SES sends instant email notifications. It's a lightweight, serverless email solution.

### Current Configuration

**Region:** us-east-1
**Verified Email:** sheelyl2@wwu.edu
**Sender:** sheelyl2@wwu.edu
**Recipient:** sheelyl2@wwu.edu
**Status:** Active (sandbox mode - can only send to verified addresses)

### Setup Steps (Already Completed)

1. ✅ Verified email address in SES (us-east-1)
2. ✅ Added SES permissions to IAM user `portfolio-app`
3. ✅ Updated Render environment variables
4. ✅ Tested contact form - emails delivering successfully

### Environment Variables (Production)

```
SES_SENDER_EMAIL=sheelyl2@wwu.edu
SES_RECIPIENT_EMAIL=sheelyl2@wwu.edu
USE_LOCAL_EMAIL=false
AWS_REGION=us-east-2 (for S3, SES uses us-east-1)
```

### IAM Permissions

The `portfolio-app` IAM user has:
- ✅ AmazonS3FullAccess (for image uploads)
- ✅ AmazonSESFullAccess (for sending emails)

### For Local Development

Set `USE_LOCAL_EMAIL=true` in your `.env` file to log emails to console instead of sending via SES.

---

## 3. IAM — Permissions (Current Setup)

**What it does:** IAM (Identity and Access Management) controls who can access which AWS services. Proper IAM setup ensures your application only has the permissions it needs.

**Current setup:** IAM user `portfolio-app` with AmazonS3FullAccess and AmazonSESFullAccess policies

**Best practices implemented:**

1. ✅ Created dedicated IAM user (not using root account)
2. ✅ Granted S3 and SES access only
3. ✅ Access keys stored as environment variables on Render
4. ⚠️ Using AWS managed policies (could be more restrictive with custom policies)

### Current IAM Policy

Currently using AWS managed policy `AmazonS3FullAccess`. For better security, consider this custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Upload",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::portfolio-images-lukesheely/*"
    },
    {
      "Sid": "SESEmail",
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "*"
    }
  ]
}
```

This policy restricts access to only the specific bucket needed.

---

## Cost Breakdown

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| S3 Storage | ~100MB images | ~$0.02 |
| S3 Requests | ~1000 GET/month | ~$0.01 |
| S3 Data Transfer | First 100GB/month free | $0.00 |
| SES | Contact form emails (~10-50/month) | $0.00 (free tier: 62K/month) |

**Total:** ~$0.50/month (S3 storage only, SES is free)

### Free Tier Details

- **S3:** First 5GB storage free for 12 months, then $0.023/GB
- **S3 Requests:** 20K GET requests free per month
- **SES:** 62K emails/month free when sending from AWS services
