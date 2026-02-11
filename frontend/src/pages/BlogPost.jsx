import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPost } from "../api";

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost(slug).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setPost(data);
      }
    });
  }, [slug]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Post Not Found</h1>
        <p className="page-subtitle">{error}</p>
        <Link to="/blog">Back to Blog</Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/blog" style={{ fontSize: "0.9rem", marginBottom: 16, display: "inline-block" }}>
        &larr; Back to Blog
      </Link>
      <h1 className="page-title">{post.title}</h1>
      <p className="card-meta" style={{ marginBottom: 24 }}>
        {formatDate(post.created_at)}
        {post.updated_at !== post.created_at && (
          <> &middot; Updated {formatDate(post.updated_at)}</>
        )}
      </p>
      <div
        className="card"
        style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
      >
        {post.content}
      </div>
    </div>
  );
}

export default BlogPost;
