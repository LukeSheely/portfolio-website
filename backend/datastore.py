"""
Flat-file data store — backend/data/*.json

This replaces the PostgreSQL/Supabase database. Public routes read these
JSON files directly; they're bundled with the deployment like any other
source file, so reads are fast and need no network call.

Vercel's serverless filesystem is read-only in production (writes only
work under /tmp, which doesn't survive between invocations), so a plain
local file write can't be how admin edits persist there. Instead, `save()`
commits the updated JSON straight to the GitHub repo via the Contents API
when GITHUB_TOKEN is configured — that commit lands on `main`, and Vercel's
existing auto-deploy hook picks it up and ships it, typically within
30-60 seconds.

Local development needs none of this: with no GITHUB_TOKEN set, `save()`
just writes the file to disk, so the admin panel works normally without
any GitHub setup.
"""

import base64
import json
import os
from datetime import datetime, timezone

import requests

import config

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def _path(name):
    return os.path.join(DATA_DIR, f"{name}.json")


def now_iso():
    """UTC timestamp in the same ISO 8601 shape the frontend already expects."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")


def next_id(items):
    """Compute the next integer id for a list of {"id": int, ...} dicts."""
    return max((item.get("id", 0) for item in items), default=0) + 1


def load(name):
    """Load a JSON collection (a list of dicts) by name, e.g. load('projects')."""
    path = _path(name)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)


def save(name, data):
    """
    Persist a JSON collection.

    Always attempts a local write first (this is what makes local dev work,
    and it's a harmless no-op failure in production — Vercel's filesystem
    simply refuses the write there, which is expected).

    When GITHUB_TOKEN is configured, also commits the change directly to
    the repo via the GitHub Contents API. That's the real persistence path
    in production; raises if it fails so the caller can report the error
    rather than pretending the save succeeded.
    """
    content = json.dumps(data, indent=2, default=str) + "\n"

    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(_path(name), "w") as f:
            f.write(content)
    except OSError:
        if not config.GITHUB_TOKEN:
            # No GitHub token configured and the local disk write failed —
            # there is no persistence path at all. Surface this loudly
            # rather than silently losing the edit.
            raise RuntimeError(
                "Could not write locally and GITHUB_TOKEN is not configured — "
                "nothing was saved."
            )

    if config.GITHUB_TOKEN:
        _commit_to_github(name, content)


def _commit_to_github(name, content):
    """Commit an updated data file to the repo via the GitHub Contents API."""
    file_path = f"backend/data/{name}.json"
    url = f"https://api.github.com/repos/{config.GITHUB_REPO}/contents/{file_path}"
    headers = {
        "Authorization": f"Bearer {config.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }

    # Look up the current file's sha — required by GitHub to update an
    # existing file; omitted (None) is fine for a brand-new one.
    get_resp = requests.get(
        url, headers=headers, params={"ref": config.GITHUB_BRANCH}, timeout=10
    )
    sha = get_resp.json().get("sha") if get_resp.status_code == 200 else None

    payload = {
        "message": f"Update {name}.json via admin panel",
        "content": base64.b64encode(content.encode()).decode(),
        "branch": config.GITHUB_BRANCH,
    }
    if sha:
        payload["sha"] = sha

    put_resp = requests.put(url, headers=headers, json=payload, timeout=10)
    if put_resp.status_code not in (200, 201):
        raise RuntimeError(
            f"GitHub commit failed ({put_resp.status_code}): {put_resp.text[:300]}"
        )
