import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { useContent, links } from "../content";
import { ProjectCard, ProjectSheet } from "../components/ProjectCard";
export default function Home() {
  const projects = useContent("projects");
  const [selected, setSelected] = useState(null);
  return (
    <div className="page overview">
      <section className="hero">
        <div className="hero-copy">
          <h1>Hi, I’m Luke Sheely.</h1>
          <p>
            I’m a computer science student at Western Washington University,
            focused on machine learning and full-stack development.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/projects">
              View projects <Icon name="arrow" size={17} />
            </Link>
          </div>
          <p className="hero-links">
            <a href={`mailto:${links.email}`}>{links.email}</a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
        </div>
        <div className="portrait-card">
          <img src="/headshot.png" alt="Luke Sheely" />
        </div>
      </section>
      <section className="work-section">
        <div className="section-heading">
          <h2>Projects</h2>
          <Link className="text-link" to="/projects">
            All projects <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="project-grid">
          {projects.slice(0, 2).map((p) => (
            <ProjectCard key={p.id} project={p} onSelect={setSelected} />
          ))}
        </div>
      </section>
      <section className="contact-banner">
        <h2>Want to work together?</h2>
        <Link className="btn btn-primary" to="/contact">
          Get in touch <Icon name="arrow" size={17} />
        </Link>
      </section>
      {selected && (
        <ProjectSheet project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
