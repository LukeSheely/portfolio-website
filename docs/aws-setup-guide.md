# AWS Setup Guide

Step-by-step instructions for setting up the AWS services used in this project.

## Prerequisites

- An AWS account ([sign up here](https://aws.amazon.com/free/))
- AWS CLI installed and configured (`aws configure`)

---

## 1. RDS — PostgreSQL Database

**What it does:** RDS (Relational Database Service) hosts and manages your PostgreSQL database in the cloud. It handles backups, patching, and scaling so you don't have to manage a database server yourself.

**Why it's used here:** We need a relational database to store projects, posts, tags, and contact messages. RDS provides a managed PostgreSQL instance accessible from our backend.

### Setup Steps

1. Go to **AWS Console > RDS > Create Database**
2. Choose **Standard Create**
3. Select **PostgreSQL** as the engine
4. Choose **Free Tier** template (db.t3.micro)
5. Configure:
   - **DB instance identifier:** `portfolio-db`
   - **Master username:** `postgres`
   - **Master password:** Choose a strong password
6. Under **Connectivity:**
   - Select your default VPC
   - Set **Public access** to **Yes** (for development — restrict in production)
   - Create a new security group or use an existing one
7. Under **Additional configuration:**
   - **Initial database name:** `portfolio`
8. Click **Create database** and wait for it to become available
9. Note the **Endpoint** from the database details page — this is your `DB_HOST`
10. Update your security group's inbound rules to allow traffic on port **5432** from your IP

### Connect and Initialize

```bash
# Connect to your RDS instance
psql -h YOUR-RDS-ENDPOINT.rds.amazonaws.com -U postgres -d portfolio

# Run the schema and seed files
psql -h YOUR-RDS-ENDPOINT -U postgres -d portfolio -f database/schema.sql
psql -h YOUR-RDS-ENDPOINT -U postgres -d portfolio -f database/seed.sql
```

### Update .env

```
DB_HOST=your-rds-endpoint.xxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=portfolio
DB_USER=postgres
DB_PASSWORD=your-rds-password
```

---

## 2. S3 — Image Storage

**What it does:** S3 (Simple Storage Service) stores files (images, documents, etc.) in the cloud with high durability and availability. Files are accessible via URLs.

**Why it's used here:** We store project screenshots uploaded through the admin page. S3 serves them directly to visitors via public URLs.

### Setup Steps

1. Go to **AWS Console > S3 > Create Bucket**
2. **Bucket name:** `portfolio-images-yourname` (must be globally unique)
3. **Region:** Same as your other services (e.g., us-east-1)
4. Uncheck **Block all public access** (we need images to be publicly readable)
   - Check the acknowledgment box
5. Click **Create bucket**
6. Go to your bucket > **Permissions** > **Bucket Policy**
7. Add this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

8. (Optional) Go to **Properties** > **Static website hosting** and enable it

### Update .env

```
S3_BUCKET=portfolio-images-yourname
USE_LOCAL_STORAGE=false
```

### IAM Permissions

Your backend needs permission to upload to S3. If running on EC2, attach an IAM role with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

If running locally, configure AWS credentials with `aws configure`.

---

## 3. SES — Email Notifications

**What it does:** SES (Simple Email Service) sends emails programmatically. We use it to send yourself an email whenever someone submits the contact form.

**Why it's used here:** Instead of checking the database for new contact messages, SES sends you an instant email notification. It's a lightweight, serverless email solution.

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

## 4. IAM — Permissions (Overview)

**What it does:** IAM (Identity and Access Management) controls who can access which AWS services. Proper IAM setup ensures your application only has the permissions it needs.

**Best practices for this project:**

1. **Don't use your root account** — Create an IAM user for development
2. **Least privilege** — Only grant the permissions each service needs:
   - Backend needs: `rds-db:connect`, `s3:PutObject`, `ses:SendEmail`
   - Nothing else
3. **Use IAM roles for EC2** — If deploying to EC2, attach an IAM role instead of hardcoding credentials
4. **Rotate credentials** — Regularly rotate access keys

### Recommended IAM Policy for the Backend

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Upload",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
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

---

## Cost Estimates (Free Tier)

| Service | Free Tier | Monthly Cost After |
|---------|-----------|-------------------|
| RDS (db.t3.micro) | 750 hours/month for 12 months | ~$15/month |
| S3 | 5 GB storage, 20K GET requests | Pennies |
| SES | 62K emails/month (from EC2) | $0.10 per 1K emails |

For a portfolio project, you'll stay well within the free tier.
