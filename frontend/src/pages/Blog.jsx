import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../api";

function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="page">
      <h1 className="page-title">Blog</h1>
      <p className="page-subtitle">
        Thoughts on development, databases, and cloud infrastructure.
      </p>

      {posts.map((post) => (
        <Link
          to={`/blog/${post.slug}`}
          key={post.id}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="card" style={{ cursor: "pointer" }}>
            <h3 className="card-title">{post.title}</h3>
            <p className="card-meta">{formatDate(post.created_at)}</p>
          </div>
        </Link>
      ))}

      {posts.length === 0 && (
        <p className="card-meta">No published posts yet.</p>
      )}
    </div>
  );
}

export default Blog;
