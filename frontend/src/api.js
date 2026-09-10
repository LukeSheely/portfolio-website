/**
 * API client — Centralized functions for communicating with the Flask backend.
 *
 * In development: uses Vite proxy (/api -> localhost:5000)
 * In production: uses the deployed backend URL from environment variable
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL + "/api"
  : "/api";

/**
 * fetch() + parse JSON, throwing on a non-2xx response so callers can
 * `catch` a real failure (e.g. a GitHub commit error from the admin data
 * store) instead of silently treating an { error } payload as success.
 */
async function requestJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

export async function fetchProjects(featured = false) {
  const url = featured
    ? `${API_BASE}/projects?featured=true`
    : `${API_BASE}/projects`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  return res.json();
}

export async function fetchTags() {
  const res = await fetch(`${API_BASE}/tags`);
  return res.json();
}

export async function fetchPosts() {
  const res = await fetch(`${API_BASE}/posts`);
  return res.json();
}

export async function fetchPost(slug) {
  const res = await fetch(`${API_BASE}/posts/${slug}`);
  return res.json();
}

export async function submitContact(data) {
  return requestJson(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
