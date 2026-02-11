# Deployment Guide

Complete guide to deploying your portfolio website using free-tier cloud services.

---

## Architecture Overview

- **Database:** Supabase (PostgreSQL) — Free tier with 500MB storage
- **Backend:** Render (Flask API) — Free tier with auto-deploy from GitHub
- **Frontend:** Vercel (React) — Free tier with CDN and auto-deploy from GitHub

Total cost: **$0/month**

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
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET` | `portfolio-images-dev` |
| `USE_LOCAL_STORAGE` | `true` |
| `LOCAL_UPLOAD_DIR` | `uploads` |
| `SES_SENDER_EMAIL` | `noreply@example.com` |
| `SES_RECIPIENT_EMAIL` | Your email |
| `USE_LOCAL_EMAIL` | `true` |
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

## Step 3: Frontend Deployment (Vercel)

### Create Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account

### Deploy React Frontend

1. Click **"Add New..."** → **"Project"**
2. Import your **portfolio-website** repository
3. Configure:
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)

### Add Environment Variable

1. Before deploying, click **"Environment Variables"**
2. Add one variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your Render backend URL (e.g., `https://portfolio-backend-abc123.onrender.com`)

### Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy (takes 1-2 minutes)
3. Once complete, you'll get a URL like `https://portfolio-website-xyz.vercel.app`

### Test the Frontend

1. Visit your Vercel URL
2. You should see your portfolio with all projects loaded
3. Try the admin page, contact form, etc.

---

## Step 4: Update README with Live URLs

Go back and update your `README.md` with the live URLs:

```markdown
## Live Demo

🌐 **[View Live Site](https://portfolio-website-xyz.vercel.app)**
🔧 **Backend API:** https://portfolio-backend-abc123.onrender.com
```

Commit and push:
```bash
git add README.md
git commit -m "Add live deployment URLs"
git push origin main
```

Both Render and Vercel will auto-redeploy when you push to GitHub.

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
- Verify `VITE_API_URL` is set correctly in Vercel
- Make sure the backend is live and responding
- Check that Flask has CORS enabled (it should via flask-cors)

**Projects not loading**
- Open browser console to see error messages
- Verify API URL in Network tab
- Test backend API directly in a new tab

---

## Maintenance

### Auto-Deployment

Both Render and Vercel automatically redeploy when you push to GitHub `main` branch.

### Free Tier Limits

- **Supabase:** 500MB database, unlimited API requests
- **Render:** Free tier apps sleep after 15 minutes of inactivity (first request after sleep takes ~30 seconds)
- **Vercel:** Unlimited deployments, 100GB bandwidth/month

### Updating Your Portfolio

1. Make changes locally
2. Test with `npm run dev` (frontend) and `python app.py` (backend)
3. Commit and push to GitHub
4. Render and Vercel auto-deploy within 2-3 minutes

---

## Optional: Custom Domain

### Vercel Custom Domain (Free)

1. Go to Vercel project settings → **Domains**
2. Add your domain
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

### Render Custom Domain (Free)

1. Go to Render service settings → **Custom Domains**
2. Add your backend domain (e.g., `api.yourdomain.com`)
3. Update DNS CNAME record
4. SSL certificate is automatically provisioned

Then update `VITE_API_URL` in Vercel to point to your custom backend domain.

---

## Next Steps

- Add more projects through the admin page
- Write blog posts
- Customize the styling in `frontend/src/index.css`
- Add your GitHub repo link to your resume
- Share the live URL in job applications
