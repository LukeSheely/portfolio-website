import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project, index = 0, details = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const number = String(index + 1).padStart(2, "0");
  const showImage = project.image_url && !imageFailed;
  return (
    <article className={"project-card project-tone-" + (index % 3)}>
      <Link
        className="project-art"
        to={"/projects#project-" + project.id}
        aria-label={"Explore " + project.title}
      >
        <div className="art-caption">
          <span>PROJECT / {number}</span>
          <span aria-hidden="true">↗</span>
        </div>
        {showImage ? (
          <img
            src={project.image_url}
            alt={project.title + " project preview"}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="typographic-art" aria-hidden="true">
            <span>{project.title}</span>
            <span className="art-asterisk">✳</span>
          </div>
        )}
        <span className="art-bottom">
          {project.tech_stack?.split(",").slice(0, 2).join(" / ") ||
            "Independent project"}
        </span>
      </Link>
      <div className="project-info" id={"project-" + project.id}>
        <div className="project-title-row">
          <h3>{project.title}</h3>
          <span className="project-number">{number}</span>
        </div>
        <p className="card-meta">{project.tech_stack}</p>
        <p
          className={
            details
              ? "card-description"
              : "card-description description-preview"
          }
        >
          {project.description}
        </p>
        <div className="card-links">
          {details ? (
            <>
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer">
                  Live project ↗
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer">
                  View source ↗
                </a>
              )}
            </>
          ) : (
            <Link to={"/projects#project-" + project.id}>
              Explore project <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
