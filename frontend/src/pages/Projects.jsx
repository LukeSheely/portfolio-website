import React, { useState } from "react";
import { useContent } from "../content";
import { ProjectCard, ProjectSheet } from "../components/ProjectCard";
export default function Projects() {
  const projects = useContent("projects");
  const [selected, setSelected] = useState(null);
  return (
    <div className="page">
      <h1 className="page-title">Projects</h1>
      <div className="project-grid">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onSelect={setSelected} />
        ))}
      </div>
      {selected && (
        <ProjectSheet project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
