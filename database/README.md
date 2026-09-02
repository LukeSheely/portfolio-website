# No database anymore

This project used to run on PostgreSQL (hosted on Supabase). It's been
migrated to a flat-file JSON data store, committed directly to the repo —
see [`backend/data/`](../backend/data) for the actual content and
[`backend/datastore.py`](../backend/datastore.py) for how reads and writes
work.

**Why:** the Flask backend runs as a Vercel serverless function, which has
no persistent disk — so a database (or a plain SQLite file) needs an
always-on host to stay reachable and writable. Free-tier Supabase projects
also auto-pause after a period of inactivity, which was causing the live
site to intermittently 500. Storing content as JSON in the repo removes
both problems: reads are instant (no network call, no cold-start wake-up),
and admin writes commit straight to GitHub, which Vercel auto-deploys.

Contact form submissions are no longer stored anywhere on the site — they
go out by email only (via AWS SES), since a visitor's submission can't
reasonably go through the same "commit to git" write path admin edits use.

This folder is kept only so the history of `git log --follow` on the old
`schema.sql` / `seed.sql` / `queries.sql` files isn't orphaned.
