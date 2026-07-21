import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProjects, fetchTags } from "../api";
import Reveal from "../components/Reveal";

function Home() {
  const [featured, setFeatured] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchProjects(true).then((data) => setFeatured(Array.isArray(data) ? data : []));
    fetchTags().then((data) => setTags(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-copy">
          <Reveal>
            <div className="status-pill">
              <span className="live" aria-hidden="true" />
              open to ML internships · 2026
            </div>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="hero-name">
              Hi, I'm <span className="grad">Luke Sheely</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="hero-lead">
              Third-year Computer Science student at Western Washington University,
              heading toward machine-learning-integrated technology — pairing
              development work with AWS and SQL experience. This site is the proof:
              designed and built end-to-end across database design, SQL, and AWS.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="hero-actions">
              <Link to="/projects" className="btn btn-primary">
                View Projects
              </Link>
              <Link to="/contact" className="btn btn-ghost">
                Get in Touch
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="hero-portrait">
          <img src="/headshot.png" alt="Luke Sheely" />
        </div>
      </section>

      {/* Featured projects */}
      <section style={{ marginTop: 72 }}>
        <Reveal className="section-heading">
          <h2>Featured Work</h2>
          <span className="rule" />
        </Reveal>

        {featured.map((project, i) => (
          <Reveal key={project.id} delay={i * 80}>
            <div className="card">
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
                <Link to="/projects">Details</Link>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* Skills */}
      <section style={{ marginTop: 64 }}>
        <Reveal className="section-heading">
          <h2>Skills &amp; Technologies</h2>
          <span className="rule" />
        </Reveal>
        <div className="tags-list">
          {tags.map((tag, i) => (
            <Reveal as="span" key={tag.id} delay={i * 40} className="tag">
              {tag.name} <span style={{ color: "var(--muted-dim)" }}>({tag.project_count})</span>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
