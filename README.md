# Portfolio Website

A full-stack portfolio website built with **React**, **Flask**, and **PostgreSQL**, deployed on **AWS**. Designed to demonstrate database design, SQL query skills, and AWS service integration.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React UI  │────▶│  Flask API   │────▶│  PostgreSQL  │
│  (Vite)     │     │  (Python)    │     │  (AWS RDS)   │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │   AWS S3     │  Image uploads
                    │   AWS SES    │  Email notifications
                    └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router + Vite |
| Backend | Python / Flask |
| Database | PostgreSQL (raw SQL via psycopg2) |
| File Storage | AWS S3 (local fallback for dev) |
| Email | AWS SES (console logging for dev) |

## Features

- **Home** — Featured projects and tag cloud
- **Projects** — All projects with expandable detail view showing tags (many-to-many JOIN)
- **Blog** — Published posts fetched via SQL, individual post pages by slug
- **Contact** — Form that saves to PostgreSQL and sends email via SES
- **Admin** — Password-protected dashboard to manage projects, posts, and messages; S3 image upload

## Database Design

Five normalized tables demonstrating relational design patterns:

- `projects` — Portfolio entries with metadata and S3 image URLs
- `posts` — Blog entries with slug-based routing and draft/published status
- `tags` — Reusable tag labels
- `project_tags` — Junction table (many-to-many relationship)
- `contact_messages` — Form submissions

See [`database/schema.sql`](database/schema.sql) for full CREATE statements with constraints and indexes.

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
- PostgreSQL (running locally)

### 1. Clone and configure

```bash
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
```

### 2. Set up the database

```bash
# Create the database
createdb portfolio

# Run schema and seed data
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
# Frontend runs on http://localhost:3000
# API requests are proxied to the backend automatically
```

### 5. Open the app

Go to [http://localhost:3000](http://localhost:3000). Log into the admin page with the password from your `.env` file (default: `admin123`).

## AWS Deployment

See [`docs/aws-setup-guide.md`](docs/aws-setup-guide.md) for step-by-step instructions on setting up:

1. **RDS** — Managed PostgreSQL instance
2. **S3** — Image storage with public read access
3. **SES** — Contact form email notifications
4. **IAM** — Least-privilege permissions

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
│   └── aws-setup-guide.md  # AWS setup instructions
├── .env.example            # Environment variable template
└── README.md
```
