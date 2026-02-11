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
- **SES** — Optional — Send real emails instead of logging to console

S3 is currently deployed and working. SES code is ready but not activated (using `USE_LOCAL_EMAIL=true`).

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

## 2. SES — Email Notifications (Optional)

**What it does:** SES (Simple Email Service) sends emails programmatically. We use it to send yourself an email whenever someone submits the contact form.

**Current setup:** Not active — using `USE_LOCAL_EMAIL=true` (logs to console)

**Why activate it:** Instead of checking the database for new contact messages, SES sends you an instant email notification. It's a lightweight, serverless email solution.

### Setup Steps

1. Go to **AWS Console > SES > Verified Identities**
2. Click **Create Identity**
3. Choose **Email address** and enter your email
4. Click the verification link in the email you receive
5. (SES Sandbox) By default, you can only send TO verified email addresses. To send to anyone, request **Production Access:**
   - Go to **SES > Account Dashboard > Request Production Access**
   - Describe your use case (portfolio contact form)
   - AWS typically approves within 24 hours

### Update .env

```
SES_SENDER_EMAIL=noreply@yourdomain.com
SES_RECIPIENT_EMAIL=your-verified-email@example.com
USE_LOCAL_EMAIL=false
```

### IAM Permissions

Your backend needs this policy to send emails:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ses:SendEmail",
      "Resource": "*"
    }
  ]
}
```

---

## 3. IAM — Permissions (Current Setup)

**What it does:** IAM (Identity and Access Management) controls who can access which AWS services. Proper IAM setup ensures your application only has the permissions it needs.

**Current setup:** IAM user `portfolio-app` with AmazonS3FullAccess policy

**Best practices implemented:**

1. ✅ Created dedicated IAM user (not using root account)
2. ✅ Granted S3 access only
3. ✅ Access keys stored as environment variables on Render
4. ⚠️ Using AmazonS3FullAccess (could be more restrictive)

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
| SES (if activated) | 62K emails/month (from EC2) | $0.10 per 1K emails |

**Total:** ~$0.50/month (mostly S3 storage)

### Free Tier Details

- **S3:** First 5GB storage free for 12 months, then $0.023/GB
- **S3 Requests:** 20K GET requests free per month
- **SES:** 62K emails/month free when sending from AWS services
