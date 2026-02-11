/**
 * API client — Centralized functions for communicating with the Flask backend.
 *
 * In development: uses Vite proxy (/api -> localhost:5000)
 * In production: uses the deployed backend URL from environment variable
 */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

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
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// Admin endpoints — require auth token
// ---------------------------------------------------------------------------

function adminHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Invalid password");
  return res.json();
}

export async function adminFetchProjects(token) {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    headers: adminHeaders(token),
  });
  return res.json();
}

export async function adminCreateProject(token, data) {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateProject(token, id, data) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: "PUT",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteProject(token, id) {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  return res.json();
}

export async function adminFetchPosts(token) {
  const res = await fetch(`${API_BASE}/admin/posts`, {
    headers: adminHeaders(token),
  });
  return res.json();
}

export async function adminCreatePost(token, data) {
  const res = await fetch(`${API_BASE}/admin/posts`, {
    method: "POST",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdatePost(token, id, data) {
  const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
    method: "PUT",
    headers: adminHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeletePost(token, id) {
  const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  return res.json();
}

export async function adminFetchMessages(token) {
  const res = await fetch(`${API_BASE}/admin/messages`, {
    headers: adminHeaders(token),
  });
  return res.json();
}

export async function adminDeleteMessage(token, id) {
  const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
    method: "DELETE",
    headers: adminHeaders(token),
  });
  return res.json();
}

export async function adminUploadImage(token, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return res.json();
}
