import React, { useState, useEffect } from "react";
import { fetchProjects, fetchProject } from "../api";
import Reveal from "../components/Reveal";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProjects().then((data) => setProjects(Array.isArray(data) ? data : []));
  }, []);

  const handleSelect = async (id) => {
    if (selected?.id === id) {
      setSelected(null);
      return;
    }
    const project = await fetchProject(id);
    setSelected(project);
  };

  return (
    <div className="page">
      <Reveal>
        <p className="eyebrow">selected work</p>
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">
          Click any project to expand its details, stack, and links.
        </p>
      </Reveal>

      {projects.map((project, i) => (
        <Reveal key={project.id} delay={i * 70}>
          <div
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => handleSelect(project.id)}
          >
            {project.image_url && (
              <img
                src={project.image_url}
                alt={project.title}
                className="project-image"
              />
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: 12,
              }}
            >
              <h3 className="card-title">{project.title}</h3>
              {project.featured && <span className="tag">Featured</span>}
            </div>
            <p className="card-meta">{project.tech_stack}</p>
            <p className="card-description">{project.description}</p>

            {selected?.id === project.id && (
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div className="tags-list">
                  {selected.tags?.map((tag) => (
                    <span className="tag" key={tag.id}>
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="card-links">
                  {selected.live_url && (
                    <a
                      href={selected.live_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Live Demo
                    </a>
                  )}
                  {selected.github_url && (
                    <a
                      href={selected.github_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default Projects;
