import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchProjects } from "../api";
import Reveal from "../components/Reveal";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [state, setState] = useState("loading");
  const { hash } = useLocation();
  useEffect(() => {
    let active = true;
    fetchProjects()
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid projects");
        if (active) {
          setProjects(data);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (state === "ready" && hash)
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ block: "center" });
  }, [state, hash]);
  return (
    <div className="page">
      <Reveal className="page-heading">
        <p className="eyebrow">THE COLLECTION / SELECTED PROJECTS</p>
        <h1 className="page-title">
          Ideas into
          <br />
          <em>real things.</em>
        </h1>
        <p className="page-subtitle">
          Experiments in machine learning, useful tools, and a little play.
          Built to learn. Made to work.
        </p>
      </Reveal>
      <div className="collection-label">
        <span>ALL WORK</span>
        <span>
          {state === "ready"
            ? String(projects.length).padStart(2, "0") + " PROJECTS"
            : "COLLECTION"}
        </span>
      </div>
      {state === "loading" && (
        <p className="loading-state" role="status">
          Opening the collection…
        </p>
      )}
      {state === "error" && (
        <p className="alert alert-error" role="alert">
          Projects couldn’t load. Please refresh or{" "}
          <a href="https://github.com/LukeSheely">visit my GitHub ↗</a>.
        </p>
      )}
      {state === "ready" && !projects.length && (
        <p>New projects are on the way.</p>
      )}
      <div className="project-grid all-projects">
        {projects.map((project, i) => (
          <Reveal key={project.id}>
            <ProjectCard project={project} index={i} details />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
