import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../api";
import Reveal from "../components/Reveal";

function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts().then((data) => setPosts(Array.isArray(data) ? data : []));
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
      <Reveal>
        <p className="eyebrow">writing</p>
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">Notes on what I'm building and learning.</p>
      </Reveal>

      {posts.map((post, i) => (
        <Reveal key={post.id} delay={i * 70}>
          <Link
            to={`/blog/${post.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card" style={{ cursor: "pointer" }}>
              <h3 className="card-title">{post.title}</h3>
              <p className="card-meta" style={{ marginBottom: 0 }}>
                {formatDate(post.created_at)}
              </p>
            </div>
          </Link>
        </Reveal>
      ))}

      {posts.length === 0 && (
        <Reveal>
          <p className="card-meta">No published posts yet — check back soon.</p>
        </Reveal>
      )}
    </div>
  );
}

export default Blog;
