# Deployment Guide

Complete guide to deploying this portfolio website on Vercel.

---

## Architecture Overview

- **Backend:** Vercel (serverless Python / Flask) — deploys from `backend/`
- **Frontend:** Vercel (static React build) — deploys from `frontend/`
- **Content:** Flat JSON files in `backend/data/`, committed to this repo via the GitHub API when you edit something in the admin panel
- **Storage:** AWS S3 (Images) — ~$0.50/month for storage

Total cost: **~$0.50/month**

Two separate Vercel projects point at the same GitHub repo — one rooted at `backend/`, one at `frontend/` — so a single `git push` to `main` redeploys both.

---

## Step 1: Backend Deployment (Vercel)

### Create the Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your **portfolio-website** repository
4. Configure:
   - **Root Directory:** `backend`
   - Vercel will detect `backend/vercel.json` and use the Python runtime automatically

### Add Environment Variables

In the project's **Settings** → **Environment Variables**, add each of these:

| Key | Value |
|-----|-------|
| `AWS_REGION` | `us-east-2` (or your bucket's region) |
| `S3_BUCKET` | `portfolio-images-lukesheely` (your bucket name) |
| `USE_LOCAL_STORAGE` | `false` |
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `SES_SENDER_EMAIL` | Your verified SES email |
| `SES_RECIPIENT_EMAIL` | Where contact form messages should go |
| `USE_LOCAL_EMAIL` | `false` |
| `ADMIN_PASSWORD` | Choose a strong password |
| `SECRET_KEY` | Random string (e.g., generate with `openssl rand -hex 32`) |
| `FRONTEND_URL` | Your frontend's Vercel URL (for CORS) |
| `GITHUB_TOKEN` | A fine-grained PAT — see below |
| `GITHUB_REPO` | `YOUR-USERNAME/portfolio-website` |
| `GITHUB_BRANCH` | `main` |

### Create the GitHub Token (`GITHUB_TOKEN`)

This is what lets the admin panel commit edits back to `backend/data/*.json`:

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Click **"Generate new token"**
3. **Repository access:** select only this repository
4. **Permissions:** under **Repository permissions**, set **Contents** to **Read and write** (leave everything else as No access)
5. Generate the token and paste it into the `GITHUB_TOKEN` env var above

Scoping it to just this one repo means a leaked token can only ever touch this project.

### Deploy

1. Click **"Deploy"**
2. Once it's live, copy your backend URL (e.g., `https://your-backend.vercel.app`)

### Test the Backend

Visit: `https://YOUR-BACKEND-URL.vercel.app/api/projects`

You should see your projects as JSON.

---

## Step 2: Frontend Deployment (Vercel)

### Create the Project

1. In Vercel, **"Add New..."** → **"Project"** again
2. Import the same repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Add Environment Variable

- **Key:** `VITE_API_URL`
- **Value:** Your backend's Vercel URL from Step 1 (e.g., `https://your-backend.vercel.app`)

### Deploy

1. Click **"Deploy"**
2. Once complete, you'll get a URL like `https://your-name.vercel.app`

### Test the Frontend

1. Visit your Vercel URL
2. You should see your portfolio with all projects loaded
3. Try the admin page, contact form, etc.

---

## Step 3: AWS S3 Setup (Image Storage)

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
            "https://your-name.vercel.app",
            "http://localhost:5173"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

3. Replace `your-name.vercel.app` with your actual frontend domain
4. Click **"Save changes"**

### Create IAM User

1. Go to **IAM** → **Users** → **Create user**
2. User name: `portfolio-app`
3. Attach policy: **AmazonS3FullAccess** (or create a custom policy with PutObject/GetObject)
4. Click **"Create user"**
5. Go to the user → **Security credentials** → **Create access key**
6. Choose **"Application running outside AWS"**
7. Copy the **Access key ID** and **Secret access key**

### Update Backend Environment Variables

Go back to the backend's Vercel project settings and set:
- `AWS_ACCESS_KEY_ID`: Your access key
- `AWS_SECRET_ACCESS_KEY`: Your secret key
- `AWS_REGION` to match your bucket region (e.g., `us-east-2`)
- `S3_BUCKET` to your bucket name
- `USE_LOCAL_STORAGE` to `false`

Vercel will automatically redeploy with the new settings.

---

## Step 4: AWS SES Setup (Email Notifications)

### Verify Your Email

1. Go to **AWS Console** → **SES** (Simple Email Service)
2. Make sure you're in **us-east-1** region (top-right dropdown)
3. Click **"Verified identities"** → **"Create identity"**
4. Choose **"Email address"**
5. Enter your email
6. Click **"Create identity"**
7. Check your email and click the verification link

### Add SES Permissions to IAM User

1. Go to **IAM** → **Users** → **portfolio-app**
2. Click **"Permissions"** → **"Add permissions"**
3. Click **"Attach policies directly"**
4. Search for **"AmazonSESFullAccess"**
5. Check the box and click **"Add permissions"**

### Update Backend Environment Variables

1. Go back to the backend's Vercel project → Environment Variables
2. Update:
   - `USE_LOCAL_EMAIL` = `false`
   - `SES_SENDER_EMAIL` = Your verified email
   - `SES_RECIPIENT_EMAIL` = Your verified email
3. Save changes (Vercel will redeploy)

### Test

1. Go to your live site's contact page
2. Submit a test message
3. Check your email for the notification! (Contact messages are only ever emailed — they're never stored on the site.)

---

## Step 5: Update README with Live URLs

Go back and update your `README.md` with the live URL:

```markdown
## Live Demo

🌐 **[View Live Site](https://your-name.vercel.app)**
```

Commit and push:
```bash
git add README.md
git commit -m "Add live deployment URL"
git push origin main
```

Both Vercel projects will auto-redeploy when you push to GitHub.

---

## Troubleshooting

### Backend Issues

**"Internal Server Error"**
- Check the backend's Vercel deployment logs (Vercel dashboard → your backend project → Deployments → latest → Logs)
- Verify environment variables are set correctly

**Admin edits aren't showing up on the live site**
- This is expected for roughly 30-60 seconds — edits commit to GitHub, then Vercel auto-deploys from that commit. Check the repo's commit history to confirm the commit landed, and the backend project's Deployments tab to see the redeploy in progress.
- If nothing ever lands: verify `GITHUB_TOKEN` is set, hasn't expired, and is scoped with **Contents: Read and write** on this repo.

**Admin panel shows an error when saving**
- The save failed — most commonly a missing/invalid `GITHUB_TOKEN`, or `GITHUB_REPO` not matching `owner/repo` exactly. The error message returned to the admin panel includes the underlying reason.

### Frontend Issues

**"Failed to fetch" or CORS errors**
- Verify `VITE_API_URL` is set correctly in the frontend's Vercel project
- Make sure the backend is live and responding
- Check that Flask has CORS enabled (it should via flask-cors) and `FRONTEND_URL` on the backend matches your frontend's actual domain

**Images not loading from S3**
- Verify S3 bucket policy allows public GetObject
- Check CORS configuration includes your Vercel domain
- Ensure `AWS_REGION` matches your bucket's actual region
- Test the S3 URL directly in browser

**Projects not loading**
- Open browser console to see error messages
- Verify the API URL in the Network tab
- Test the backend API directly in a new tab

---

## Maintenance

### Auto-Deployment

Both Vercel projects automatically redeploy when you push to GitHub `main` — including the commits the admin panel makes on your behalf when you edit content.

### Free Tier Limits

- **Vercel:** Generous free tier for personal projects on both static hosting and serverless functions
- **AWS S3:** ~$0.50/month for typical portfolio image storage
- **GitHub API:** Admin edits use a handful of API calls per save — nowhere close to rate limits at personal-portfolio scale

### Updating Your Portfolio

- **Content (projects, interests, posts):** Edit through the admin panel — it commits directly, no local git steps needed.
- **Code / design:** Make changes locally, test with `npm run dev` (frontend) and `python app.py` (backend), then commit and push to GitHub as usual. Vercel auto-deploys within a minute or two.

---

## Optional: Custom Domain

1. Go to either Vercel project → **Settings** → **Domains**
2. Add your domain
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

Do this for the frontend project for your main domain, and (optionally) the backend project for something like `api.yourdomain.com`. If you use a custom backend domain, update `VITE_API_URL` on the frontend to match.

---

## Next Steps

- Add more projects through the admin page
- Write blog posts
- Customize the styling in `frontend/src/index.css`
- Add your GitHub repo link to your resume
- Share the live URL in job applications
