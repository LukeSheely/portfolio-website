# Portfolio Website

A full-stack portfolio website built with **React**, **Flask**, and **PostgreSQL**. Designed to demonstrate database design, SQL query skills, and cloud deployment best practices.

## Live Demo

🌐 **[View Live Site](https://courageous-dieffenbachia-6ef8eb.netlify.app/)**
🔧 **Backend API:** https://portfolio-backend-zkb1.onrender.com

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React UI  │────▶│  Flask API   │────▶│  PostgreSQL  │
│  (Netlify)  │     │  (Render)    │     │  (Supabase)  │
└─────────────┘     └──────────────┘     └──────────────┘
```

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 18 + React Router + Vite | Netlify (free tier) |
| Backend | Python 3 + Flask + CORS | Render (free tier) |
| Database | PostgreSQL 17 (raw SQL via psycopg2) | Supabase (free tier) |
| Deployment | GitHub Actions + Git | GitHub |

**AWS Integration:** The codebase includes production-ready S3 and SES integration code (see `backend/services/`) that can be activated by setting environment variables. Currently using local fallbacks to minimize costs during development.

## Features

- **Home** — Featured projects and tag cloud
- **Projects** — All projects with expandable detail view showing tags (many-to-many JOIN)
- **Blog** — Published posts fetched via SQL, individual post pages by slug
- **Contact** — Form that saves to PostgreSQL and sends email notifications
- **Admin** — Password-protected dashboard to manage projects, posts, and messages

## Database Design

Five normalized tables demonstrating relational design patterns:

- `projects` — Portfolio entries with metadata and optional image URLs
- `posts` — Blog entries with slug-based routing and draft/published status
- `tags` — Reusable tag labels
- `project_tags` — Junction table (many-to-many relationship)
- `contact_messages` — Form submissions

See [`database/schema.sql`](database/schema.sql) for full CREATE statements with constraints, indexes, and foreign keys.

## SQL Skills Demonstrated

All queries are documented in [`database/queries.sql`](database/queries.sql):

1. **Basic SELECT** — Fetch published posts
2. **WHERE + ORDER BY** — Filter featured projects
3. **JOIN** — Resolve many-to-many (projects ↔ tags) across 3 tables
4. **Aggregate** — COUNT projects per tag with GROUP BY
5. **INSERT** — Add projects/posts with RETURNING
6. **UPDATE** — Edit projects with RETURNING
7. **DELETE** — Remove contact messages
8. **Parameterized queries** — SQL injection prevention
9. **BONUS:** Subquery with EXISTS, UPSERT with ON CONFLICT

All application code uses **raw SQL** (no ORM) via psycopg2 with parameterized queries.

## Local Development Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (or use Supabase credentials)

### 1. Clone and configure

```bash
git clone https://github.com/LukeSheely/portfolio-website.git
cd portfolio-website
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Set up the database

**Option A: Use Supabase (recommended)**
- Create a free account at [supabase.com](https://supabase.com)
- Create a new project and get your connection details
- Update `.env` with Supabase credentials
- Run schema: Use Supabase SQL Editor or connect via psql

**Option B: Local PostgreSQL**
```bash
createdb portfolio
psql -d portfolio -f database/schema.sql
psql -d portfolio -f database/seed.sql
```

### 3. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Backend runs on http://localhost:5000
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
# API requests are proxied to the backend automatically
```

### 5. Open the app

Go to [http://localhost:5173](http://localhost:5173). Log into the admin page with the password from your `.env` file (default: `admin123`).

## Deployment

This project is deployed using free-tier cloud services:

### Database: Supabase
- Free PostgreSQL database with 500MB storage
- Connection pooling for better performance
- Automated backups

### Backend: Render
- Free web service tier
- Auto-deploys from GitHub `main` branch
- Environment variables configured in Render dashboard

### Frontend: Netlify
- Free static hosting with global CDN
- Auto-deploys from GitHub on push
- Environment variable: `VITE_API_URL` points to Render backend

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for detailed deployment instructions.

## AWS Integration (Optional)

The codebase includes AWS service integrations that can be activated:

- **S3** — Image upload/storage (code in `backend/services/s3.py`)
- **SES** — Email notifications (code in `backend/services/email.py`)

To activate, set up AWS services and update environment variables:
- `USE_LOCAL_STORAGE=false` + configure S3 bucket
- `USE_LOCAL_EMAIL=false` + configure SES

See [`docs/aws-setup-guide.md`](docs/aws-setup-guide.md) for AWS setup instructions.

## Project Structure

```
├── database/
│   ├── schema.sql          # CREATE TABLE statements
│   ├── seed.sql            # Sample data
│   └── queries.sql         # Documented SQL query showcase
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── config.py           # Environment configuration
│   ├── db.py               # Database connection (psycopg2)
│   ├── Procfile            # Render deployment config
│   ├── routes/
│   │   ├── projects.py     # Public project endpoints
│   │   ├── posts.py        # Public blog endpoints
│   │   ├── contact.py      # Contact form endpoint
│   │   └── admin.py        # Protected admin CRUD endpoints
│   └── services/
│       ├── s3.py           # S3 file upload (with local fallback)
│       └── email.py        # SES email sending (with local fallback)
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Routes and navigation
│   │   ├── api.js          # API client functions
│   │   └── pages/          # Home, Projects, Blog, Contact, Admin
│   └── vite.config.js      # Dev server with API proxy
├── docs/
│   ├── deployment-guide.md # Deployment instructions
│   └── aws-setup-guide.md  # Optional AWS setup
├── .env.example            # Environment variable template
└── README.md
```

## Technologies & Skills Demonstrated

- **Backend:** Python, Flask, REST API design, CORS
- **Database:** PostgreSQL, SQL (raw queries, JOINs, aggregates, transactions)
- **Frontend:** React, React Router, modern JavaScript (ES6+)
- **Cloud:** Supabase, Render, Vercel, GitHub
- **AWS:** boto3 SDK, S3, SES integration (code ready, not deployed)
- **DevOps:** Git, environment configuration, deployment pipelines
- **Security:** Parameterized queries (SQL injection prevention), password-based admin auth

## License

MIT
