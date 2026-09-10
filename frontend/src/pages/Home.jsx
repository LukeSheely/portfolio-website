import React, { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { useContent } from "../content";
import { ProjectCard, ProjectSheet } from "../components/ProjectCard";
export default function Home() {
  const projects = useContent("projects");
  const [selected, setSelected] = useState(null);
  return (
    <div className="page overview">
      <section className="hero">
        <div className="hero-copy">
          <div className="status-pill">
            <span /> Open to summer 2027 internships
          </div>
          <h1>Hi, I’m Luke Sheely.</h1>
          <p>
            I’m a computer science student at Western Washington University,
            focused on machine learning and full-stack development.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/projects">
              Explore my work <Icon name="arrow" size={17} />
            </Link>
            <Link className="text-link" to="/contact">
              Let’s talk <Icon name="up" size={16} />
            </Link>
          </div>
        </div>
        <div className="profile-composition">
          <div className="portrait-card">
            <img src="/headshot.png" alt="Luke Sheely" />
            <div className="portrait-caption">
              <strong>Hey, I’m Luke.</strong>
              <p>Student. Developer. Always learning.</p>
            </div>
          </div>
          <div className="education-chip">
            <span className="app-icon blue">
              <Icon name="book" />
            </span>
            <div>
              <strong>Western Washington University</strong>
              <span>Computer Science · Fourth year</span>
            </div>
          </div>
        </div>
      </section>
      <section className="quick-grid" aria-label="About me">
        <div className="quick-card">
          <span className="app-icon purple">
            <Icon name="chip" />
          </span>
          <div>
            <span className="eyebrow">EXPLORING</span>
            <strong>Machine learning</strong>
            <p>Turning data into something useful.</p>
          </div>
        </div>
        <div className="quick-card">
          <span className="app-icon blue">
            <Icon name="code" />
          </span>
          <div>
            <span className="eyebrow">BUILDING WITH</span>
            <strong>Python, React & AWS</strong>
            <p>From the first idea to deployment.</p>
          </div>
        </div>
      </section>
      <section className="work-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELECTED PROJECTS</p>
            <h2>A few things I’ve built.</h2>
          </div>
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
        <div>
          <span className="eyebrow">GOOD THINGS START WITH A CONVERSATION</span>
          <h2>Have something in mind?</h2>
          <p>I’d love to hear about it.</p>
        </div>
        <Link className="btn btn-primary" to="/contact">
          Say hello <Icon name="message" size={18} />
        </Link>
      </section>
      {selected && (
        <ProjectSheet project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
