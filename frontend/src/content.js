import { useEffect, useState } from "react";
import projects from "./data/projects.json";
import tags from "./data/tags.json";
import { fetchProjects, fetchTags } from "./api";
const sources = {
  projects: [projects, fetchProjects],
  tags: [tags, fetchTags],
};
// The committed content is available immediately and remains readable offline.
export function useContent(kind) {
  const [items, setItems] = useState(sources[kind][0]);
  useEffect(() => {
    let active = true;
    sources[kind][1]()
      .then((data) => {
        if (active && Array.isArray(data)) setItems(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [kind]);
  return items;
}
export function category(project) {
  return /Unity/.test(project.tech_stack)
    ? "Games"
    : /PyTorch|scikit/.test(project.tech_stack)
      ? "Machine learning"
      : "Web apps";
}
