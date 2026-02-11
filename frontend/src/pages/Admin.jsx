import React, { useState, useEffect } from "react";
import {
  adminLogin,
  adminFetchProjects,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
  adminFetchPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminFetchMessages,
  adminDeleteMessage,
  adminUploadImage,
} from "../api";

function Admin() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("projects");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await adminLogin(password);
      setToken(result.token);
      setLoginError("");
    } catch {
      setLoginError("Invalid password");
    }
  };

  if (!token) {
    return (
      <div className="page">
        <h1 className="page-title">Admin</h1>
        <p className="page-subtitle">Log in to manage your portfolio.</p>
        {loginError && <div className="alert alert-error">{loginError}</div>}
        <form onSubmit={handleLogin} className="card" style={{ maxWidth: 400 }}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <button className="btn btn-small" onClick={() => setToken(null)}>
          Log Out
        </button>
      </div>

      <div className="admin-tabs">
        {["projects", "posts", "messages"].map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "projects" && <ProjectsAdmin token={token} />}
      {tab === "posts" && <PostsAdmin token={token} />}
      {tab === "messages" && <MessagesAdmin token={token} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Projects Tab
// ---------------------------------------------------------------------------

function ProjectsAdmin({ token }) {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", tech_stack: "",
    live_url: "", github_url: "", image_url: "", featured: false,
  });

  const load = () => adminFetchProjects(token).then(setProjects);
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({
      title: "", description: "", tech_stack: "",
      live_url: "", github_url: "", image_url: "", featured: false,
    });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await adminUpdateProject(token, editing, form);
    } else {
      await adminCreateProject(token, form);
    }
    resetForm();
    load();
  };

  const handleEdit = (project) => {
    setEditing(project.id);
    setForm({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack,
      live_url: project.live_url || "",
      github_url: project.github_url || "",
      image_url: project.image_url || "",
      featured: project.featured,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      await adminDeleteProject(token, id);
      load();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await adminUploadImage(token, file);
    if (result.url) {
      setForm({ ...form, image_url: result.url });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card">
        <h3 style={{ marginBottom: 16 }}>{editing ? "Edit Project" : "Add Project"}</h3>
        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Tech Stack</label>
          <input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="e.g. Python, Flask, PostgreSQL" />
        </div>
        <div className="form-group">
          <label>Live URL</label>
          <input value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
        </div>
        <div className="form-group">
          <label>GitHub URL</label>
          <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Project Image (S3 Upload)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {form.image_url && (
            <p style={{ marginTop: 4, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Uploaded: {form.image_url}
            </p>
          )}
        </div>
        <div className="form-group">
          <label className="checkbox-group">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured project
          </label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add"} Project</button>
          {editing && <button type="button" className="btn btn-small" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <h3 style={{ margin: "24px 0 12px" }}>All Projects</h3>
      {projects.map((p) => (
        <div className="card" key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <strong>{p.title}</strong>
            {p.featured && <span className="tag" style={{ marginLeft: 8 }}>Featured</span>}
            <p className="card-meta">{p.tech_stack}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-small btn-primary" onClick={() => handleEdit(p)}>Edit</button>
            <button className="btn btn-small btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Posts Tab
// ---------------------------------------------------------------------------

function PostsAdmin({ token }) {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "", content: "", slug: "", published: false,
  });

  const load = () => adminFetchPosts(token).then(setPosts);
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", slug: "", published: false });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await adminUpdatePost(token, editing, form);
    } else {
      await adminCreatePost(token, form);
    }
    resetForm();
    load();
  };

  const handleEdit = (post) => {
    setEditing(post.id);
    setForm({
      title: post.title,
      content: post.content || "",
      slug: post.slug,
      published: post.published,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this post?")) {
      await adminDeletePost(token, id);
      load();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card">
        <h3 style={{ marginBottom: 16 }}>{editing ? "Edit Post" : "Add Post"}</h3>
        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Slug</label>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title if empty" />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ minHeight: 200 }} required />
        </div>
        <div className="form-group">
          <label className="checkbox-group">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add"} Post</button>
          {editing && <button type="button" className="btn btn-small" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <h3 style={{ margin: "24px 0 12px" }}>All Posts</h3>
      {posts.map((p) => (
        <div className="card" key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <strong>{p.title}</strong>
            <span className="tag" style={{ marginLeft: 8 }}>{p.published ? "Published" : "Draft"}</span>
            <p className="card-meta">/{p.slug}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-small btn-primary" onClick={() => handleEdit(p)}>Edit</button>
            <button className="btn btn-small btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Messages Tab
// ---------------------------------------------------------------------------

function MessagesAdmin({ token }) {
  const [messages, setMessages] = useState([]);

  const load = () => adminFetchMessages(token).then(setMessages);
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this message?")) {
      await adminDeleteMessage(token, id);
      load();
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>Contact Messages</h3>
      {messages.length === 0 && <p className="card-meta">No messages yet.</p>}
      {messages.map((m) => (
        <div className="card" key={m.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <strong>{m.name}</strong> &lt;{m.email}&gt;
              <p className="card-meta">{formatDate(m.created_at)}</p>
            </div>
            <button className="btn btn-small btn-danger" onClick={() => handleDelete(m.id)}>Delete</button>
          </div>
          <p style={{ marginTop: 8 }}>{m.message}</p>
        </div>
      ))}
    </div>
  );
}

export default Admin;
