import React, { useState, useEffect } from "react";
import { fetchProjects, fetchProject } from "../api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProjects().then(setProjects);
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
      <h1 className="page-title">Projects</h1>
      <p className="page-subtitle">
        Click on a project to see its details and associated tags.
      </p>

      {projects.map((project) => (
        <div
          className="card"
          key={project.id}
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
            }}
          >
            <h3 className="card-title">{project.title}</h3>
            {project.featured && <span className="tag">Featured</span>}
          </div>
          <p className="card-meta">{project.tech_stack}</p>
          <p className="card-description">{project.description}</p>

          {selected?.id === project.id && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
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
      ))}
    </div>
  );
}

export default Projects;
