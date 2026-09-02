# Portfolio Website

A full-stack portfolio website built with **React** and **Flask**, deployed entirely on **Vercel**. Content (projects, interests, blog posts) lives as flat JSON files committed straight to this repo — no database to run, pause, or pay for.

## Live Demo

🌐 **[View Live Site](https://lukesheely.vercel.app/)**

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   React UI  │────▶│    Flask API      │────▶│   AWS S3     │
│  (Vercel)   │     │    (Vercel)       │     │  (Images)    │
└─────────────┘     └─────────┬────────┘     └──────────────┘
                               │
                     reads/writes backend/data/*.json
                               │
                        admin writes commit
                        via the GitHub API ──▶ GitHub (this repo)
                                                       │
                                              Vercel auto-deploys
                                                on every push
```

Public reads hit the JSON files bundled with the deployment — no network call, no cold-start wake-up. Admin edits commit the updated file straight to `main` via the GitHub Contents API, and Vercel's existing auto-deploy picks it up from there (typically live within 30-60 seconds).

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 18 + React Router + Vite | Vercel |
| Backend | Python 3 + Flask + CORS | Vercel (serverless) |
| Content | Flat JSON files, committed via the GitHub API | This repo (`backend/data/`) |
| Storage | AWS S3 (images) | AWS S3 |
| Email | AWS SES (contact form notifications) | AWS SES |
| Deployment | Git push → Vercel auto-deploy | GitHub + Vercel |

## Features

- **Home** — Featured projects and a tag cloud
- **Projects** — All projects with an expandable detail view showing tags
- **Interests** — Flip cards, each swapping the background into a themed animation
- **Contact** — Form that emails you directly via AWS SES (nothing is stored server-side)
- **Admin** — Password-protected dashboard to manage projects, posts, and interests

## Content Model

Everything lives as JSON in [`backend/data/`](backend/data):

- `projects.json` — Portfolio entries, each with a `tag_ids` array
- `tags.json` — Reusable tag labels (project counts are computed at read time)
- `interests.json` — Interests page cards (title, blurb, description, accent color, background theme)
- `posts.json` — Blog entries with slug-based routing and a draft/published flag

See [`backend/datastore.py`](backend/datastore.py) for how reads and writes work, and [`database/README.md`](database/README.md) for why this replaced a PostgreSQL/Supabase database.

## Local Development Setup

### Prerequisites

- Python 3.9+
- Node.js 18+

No database, no AWS account, and no GitHub token are required to run this locally — every service has a working local fallback (see `.env.example`).

### 1. Clone and configure

```bash
git clone https://github.com/LukeSheely/portfolio-website.git
cd portfolio-website
cp .env.example backend/.env
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Backend runs on http://localhost:5000
# Admin edits write straight to backend/data/*.json on disk
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
# API requests are proxied to the backend automatically
```

### 4. Open the app

Go to [http://localhost:5173](http://localhost:5173). Log into the admin page with the password from your `.env` file (default: `admin123`).

## Deployment

This project deploys entirely on Vercel — two projects from the same repo, one rooted at `frontend/`, one rooted at `backend/`.

### Backend: Vercel (serverless Python)
- Deploys via [`backend/vercel.json`](backend/vercel.json) (`@vercel/python`)
- Auto-deploys from GitHub `main`
- Env vars set in the Vercel dashboard (see `.env.example` for the full list) — `GITHUB_TOKEN`, `GITHUB_REPO`, and `GITHUB_BRANCH` are what let admin edits commit back to this repo

### Frontend: Vercel
- Auto-deploys from GitHub `main`
- Env var: `VITE_API_URL` points to the backend's Vercel URL
- `vercel.json` rewrites all routes to `index.html` (SPA routing)

### Storage: AWS S3
- Images stored in `portfolio-images-lukesheely` (us-east-2)
- Public read access with CORS configured
- Automatic uploads via the admin panel

### Email: AWS SES
- Contact form notifications sent directly to your inbox
- Verified identity in us-east-1

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for detailed deployment instructions and [`docs/aws-setup-guide.md`](docs/aws-setup-guide.md) for AWS setup.

## Project Structure

```
├── database/
│   └── README.md           # Why there's no database anymore
├── backend/
│   ├── app.py               # Flask application entry point
│   ├── config.py            # Environment configuration
│   ├── datastore.py         # Flat-file JSON store + GitHub-commit writes
│   ├── data/                # projects.json, tags.json, posts.json, interests.json
│   ├── vercel.json          # Vercel serverless deployment config
│   ├── routes/
│   │   ├── projects.py      # Public project endpoints
│   │   ├── posts.py         # Public blog endpoints
│   │   ├── interests.py     # Public interests endpoint
│   │   ├── contact.py       # Contact form endpoint (emails via SES)
│   │   └── admin.py         # Protected admin CRUD endpoints
│   └── services/
│       ├── s3.py            # S3 file upload (with local fallback)
│       └── email.py         # SES email sending (with local fallback)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Routes and navigation
│   │   ├── api.js           # API client functions
│   │   └── pages/           # Home, Projects, Interests, Contact, Admin
│   └── vite.config.js       # Dev server with API proxy
├── docs/
│   ├── deployment-guide.md  # Deployment instructions
│   └── aws-setup-guide.md   # AWS S3 / SES setup
├── .env.example              # Environment variable template
└── README.md
```

## Technologies & Skills Demonstrated

- **Backend:** Python, Flask, REST API design, CORS
- **Frontend:** React, React Router, modern JavaScript (ES6+), WebGL/canvas animation
- **Content architecture:** Git-backed CMS pattern (flat-file storage, API-driven commits, CI/CD-triggered publishing)
- **Cloud:** Vercel (serverless functions + static hosting), GitHub Contents API
- **AWS:** boto3 SDK, S3 (deployed), SES (deployed)
- **DevOps:** Git, environment configuration, CORS configuration, serverless deployment constraints
- **Security:** Password-based admin auth, scoped API tokens, rate limiting

## License

MIT
