import React, { useState } from "react";
import { useContent, category } from "../content";
import Icon from "../components/Icon";
import { ProjectCard, ProjectSheet } from "../components/ProjectCard";
export default function Projects() {
  const projects = useContent("projects");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const visible = projects.filter(
    (p) =>
      (filter === "All" || category(p) === filter) &&
      `${p.title} ${p.tech_stack}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="page">
      <p className="eyebrow">THE PROJECT LIBRARY</p>
      <h1 className="page-title">Ideas, made real.</h1>
      <p className="page-subtitle">
        A collection of experiments, useful tools, and things built to learn.
      </p>
      <div className="project-toolbar">
        <div className="segmented" aria-label="Filter projects">
          {["All", "Web apps", "Machine learning", "Games"].map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="search">
          <Icon name="search" size={17} />
          <input
            aria-label="Search projects"
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="results-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>
      <div className="project-grid">
        {visible.map((p) => (
          <ProjectCard key={p.id} project={p} onSelect={setSelected} />
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <h2>No projects found</h2>
          <p>Try another keyword or category.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {selected && (
        <ProjectSheet project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
