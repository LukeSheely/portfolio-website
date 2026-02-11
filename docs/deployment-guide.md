# Deployment Guide

Complete guide to deploying your portfolio website using free-tier cloud services.

---

## Architecture Overview

- **Database:** Supabase (PostgreSQL) — Free tier with 500MB storage
- **Backend:** Render (Flask API) — Free tier with auto-deploy from GitHub
- **Frontend:** Netlify (React) — Free tier with CDN and auto-deploy from GitHub
- **Storage:** AWS S3 (Images) — ~$0.50/month for storage

Total cost: **~$0.50/month**

---

## Step 1: Database Setup (Supabase)

### Create Account and Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub (easiest)
3. Click **"New Project"**
4. Fill in:
   - **Name:** `portfolio`
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you
5. Click **"Create new project"** (takes 2-3 minutes)

### Get Connection Details

1. Go to **Settings** → **Database**
2. Under **Connection string**, select **"Session mode"** or **"Connection pooling"**
3. Copy the pooler host (e.g., `aws-0-us-west-2.pooler.supabase.com`)
4. Note the port (usually `6543` for pooler)
5. Your username format: `postgres.PROJECT_REF` (find PROJECT_REF in Settings)

### Load Your Schema

Use the Supabase SQL Editor:
1. Click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy/paste your `database/schema.sql` content
4. Click **"Run"**
5. Repeat for your project data (or use the seed.sql)

---

## Step 2: Backend Deployment (Render)

### Create Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account

### Deploy Flask Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if prompted
3. Select your **portfolio-website** repository
4. Configure:
   - **Name:** `portfolio-backend` (or your choice)
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** `Free`

### Add Environment Variables

Scroll down to **Environment Variables** and add each of these:

| Key | Value |
|-----|-------|
| `DB_HOST` | Your Supabase pooler host (e.g., `aws-0-us-west-2.pooler.supabase.com`) |
| `DB_PORT` | `6543` |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres.YOUR_PROJECT_REF` |
| `DB_PASSWORD` | Your Supabase database password |
| `AWS_REGION` | `us-east-2` |
| `S3_BUCKET` | `portfolio-images-lukesheely` (your bucket name) |
| `USE_LOCAL_STORAGE` | `false` |
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `LOCAL_UPLOAD_DIR` | `uploads` |
| `SES_SENDER_EMAIL` | `sheelyl2@wwu.edu` (verified in SES) |
| `SES_RECIPIENT_EMAIL` | `sheelyl2@wwu.edu` |
| `USE_LOCAL_EMAIL` | `false` |
| `ADMIN_PASSWORD` | Choose a strong password |
| `SECRET_KEY` | Random string (e.g., generate with `openssl rand -hex 32`) |

### Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy (takes 2-3 minutes)
3. Once it shows **"Live"**, copy your backend URL (e.g., `https://portfolio-backend-abc123.onrender.com`)

### Test the Backend

Visit: `https://YOUR-RENDER-URL.onrender.com/api/projects`

You should see your projects as JSON.

---

## Step 3: Frontend Deployment (Netlify)

### Create Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with your GitHub account

### Deploy React Frontend

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **GitHub** and authorize Netlify
3. Select your **portfolio-website** repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

### Add Environment Variable

1. Before deploying, click **"Show advanced"** → **"New variable"**
2. Add one variable:
   - **Key:** `VITE_API_URL`
   - **Value:** Your Render backend URL (e.g., `https://portfolio-backend-zkb1.onrender.com`)

### Deploy

1. Click **"Deploy site"**
2. Netlify will build and deploy (takes 1-2 minutes)
3. Once complete, you'll get a URL like `https://random-name-123.netlify.app`

### Customize Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Options"** → **"Edit site name"**
3. Change to a custom subdomain (e.g., `yourname.netlify.app`)

### Test the Frontend

1. Visit your Netlify URL
2. You should see your portfolio with all projects loaded
3. Try the admin page, contact form, etc.

---

## Step 4: AWS S3 Setup (Image Storage)

### Create S3 Bucket

1. Go to **AWS Console** → **S3** → **Create bucket**
2. Configure:
   - **Bucket name:** `portfolio-images-yourname` (must be globally unique)
   - **Region:** `us-east-2` (or your preferred region)
   - **Uncheck** "Block all public access"
   - Acknowledge the warning
3. Click **"Create bucket"**

### Configure Bucket Policy

1. Go to your bucket → **Permissions** → **Bucket policy**
2. Click **"Edit"** and add this policy (replace `YOUR-BUCKET-NAME`):

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

3. Click **"Save changes"**

### Configure CORS

1. Go to your bucket → **Permissions** → **Cross-origin resource sharing (CORS)**
2. Click **"Edit"** and add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": [
            "https://yourname.netlify.app",
            "http://localhost:5173"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

3. Replace `yourname.netlify.app` with your actual Netlify domain
4. Click **"Save changes"**

### Create IAM User

1. Go to **IAM** → **Users** → **Create user**
2. User name: `portfolio-app`
3. Attach policy: **AmazonS3FullAccess** (or create a custom policy with PutObject/GetObject)
4. Click **"Create user"**
5. Go to the user → **Security credentials** → **Create access key**
6. Choose **"Application running outside AWS"**
7. Copy the **Access key ID** and **Secret access key**

### Update Render Environment Variables

Go back to Render and add these variables:
- `AWS_ACCESS_KEY_ID`: Your access key
- `AWS_SECRET_ACCESS_KEY`: Your secret key
- Update `AWS_REGION` to match your bucket region (e.g., `us-east-2`)
- Update `S3_BUCKET` to your bucket name
- Change `USE_LOCAL_STORAGE` to `false`

Render will automatically redeploy with the new settings.

---

## Step 5: AWS SES Setup (Email Notifications)

### Verify Your Email

1. Go to **AWS Console** → **SES** (Simple Email Service)
2. Make sure you're in **us-east-1** region (top-right dropdown)
3. Click **"Verified identities"** → **"Create identity"**
4. Choose **"Email address"**
5. Enter your email (e.g., `sheelyl2@wwu.edu`)
6. Click **"Create identity"**
7. Check your email and click the verification link

### Add SES Permissions to IAM User

1. Go to **IAM** → **Users** → **portfolio-app**
2. Click **"Permissions"** → **"Add permissions"**
3. Click **"Attach policies directly"**
4. Search for **"AmazonSESFullAccess"**
5. Check the box and click **"Add permissions"**

### Update Render Environment Variables

1. Go back to Render → Environment
2. Update:
   - `USE_LOCAL_EMAIL` = `false`
   - `SES_SENDER_EMAIL` = Your verified email
   - `SES_RECIPIENT_EMAIL` = Your verified email
3. Save changes (Render will redeploy)

### Test

1. Go to your live site's contact page
2. Submit a test message
3. Check your email for the notification!

---

## Step 6: Update README with Live URLs

Go back and update your `README.md` with the live URLs:

```markdown
## Live Demo

🌐 **[View Live Site](https://yourname.netlify.app)**
🔧 **Backend API:** https://portfolio-backend-abc123.onrender.com
```

Commit and push:
```bash
git add README.md
git commit -m "Add live deployment URLs"
git push origin main
```

Both Render and Netlify will auto-redeploy when you push to GitHub.

---

## Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check Render logs (click "Logs" tab)
- Verify environment variables are set correctly
- Make sure Supabase credentials are correct

**Database connection errors**
- Verify `DB_USER` format: `postgres.PROJECT_REF`
- Check that you're using the pooler host, not the direct host
- Ensure port is `6543` for pooler

### Frontend Issues

**"Failed to fetch" or CORS errors**
- Verify `VITE_API_URL` is set correctly in Netlify
- Make sure the backend is live and responding
- Check that Flask has CORS enabled (it should via flask-cors)

**Images not loading from S3**
- Verify S3 bucket policy allows public GetObject
- Check CORS configuration includes your Netlify domain
- Ensure AWS_REGION matches your bucket's actual region
- Test S3 URL directly in browser

**Projects not loading**
- Open browser console to see error messages
- Verify API URL in Network tab
- Test backend API directly in a new tab

---

## Maintenance

### Auto-Deployment

Both Render and Netlify automatically redeploy when you push to GitHub `main` branch.

### Free Tier Limits

- **Supabase:** 500MB database, unlimited API requests
- **Render:** Free tier apps sleep after 15 minutes of inactivity (first request after sleep takes ~30 seconds)
- **Netlify:** 100GB bandwidth/month, 300 build minutes/month
- **AWS S3:** ~$0.50/month for typical portfolio image storage

### Updating Your Portfolio

1. Make changes locally
2. Test with `npm run dev` (frontend) and `python app.py` (backend)
3. Commit and push to GitHub
4. Render and Vercel auto-deploy within 2-3 minutes

---

## Optional: Custom Domain

### Netlify Custom Domain (Free)

1. Go to Netlify site settings → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain
4. Update DNS records as instructed by Netlify
5. SSL certificate is automatically provisioned

### Render Custom Domain (Free)

1. Go to Render service settings → **Custom Domains**
2. Add your backend domain (e.g., `api.yourdomain.com`)
3. Update DNS CNAME record
4. SSL certificate is automatically provisioned

Then update `VITE_API_URL` in Netlify to point to your custom backend domain.

---

## Next Steps

- Add more projects through the admin page
- Write blog posts
- Customize the styling in `frontend/src/index.css`
- Add your GitHub repo link to your resume
- Share the live URL in job applications
