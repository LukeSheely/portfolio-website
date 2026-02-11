import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProjects, fetchTags } from "../api";

function Home() {
  const [featured, setFeatured] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchProjects(true).then(setFeatured);
    fetchTags().then(setTags);
  }, []);

  return (
    <div className="page">
      <section style={{ marginBottom: 48 }}>
        <h1 className="page-title">Hi, I'm Luke Sheely</h1>
        <p className="page-subtitle" style={{ maxWidth: 600 }}>
          Currently a 3rd year Computer Science student at Western Washington University,
          I hope to get into the field of Machine Learning integrated technology, incorporating
          my development skills along with AWS and SQL experience. This portfolio website, being
          the project demonstrating my skills in database design, SQL, and AWS service integration.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/projects" className="btn btn-primary">
            View Projects
          </Link>
          <Link to="/contact" className="btn btn-primary" style={{ background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)" }}>
            Get in Touch
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ marginBottom: 16 }}>Featured Projects</h2>
        {featured.map((project) => (
          <div className="card" key={project.id}>
            {project.image_url && (
              <img
                src={project.image_url}
                alt={project.title}
                className="project-image"
              />
            )}
            <h3 className="card-title">{project.title}</h3>
            <p className="card-meta">{project.tech_stack}</p>
            <p className="card-description">{project.description}</p>
            <div className="card-links">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer">
                  Live Demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              )}
              <Link to={`/projects`}>Details</Link>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 style={{ marginBottom: 16 }}>Skills & Technologies</h2>
        <div className="tags-list">
          {tags.map((tag) => (
            <span className="tag" key={tag.id}>
              {tag.name} ({tag.project_count})
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
