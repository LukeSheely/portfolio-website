import React, { useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import Icon from "./Icon";
import { category } from "../content";
// Real screenshots and plots only; projects without one simply have no artwork.
// Images wider than the frame (charts) are shown whole so their axes survive;
// anything else fills the frame.
export function ProjectArt({ project }) {
  const [fit, setFit] = useState("cover");
  if (!project.image_url) return null;
  return (
    <div className="project-art">
      <img
        src={project.image_url}
        alt=""
        loading="lazy"
        style={{ objectFit: fit }}
        onLoad={(e) => {
          const { naturalWidth: w, naturalHeight: h, parentElement } = e.currentTarget;
          if (w / h > parentElement.clientWidth / parentElement.clientHeight)
            setFit("contain");
        }}
      />
    </div>
  );
}
export function ProjectCard({ project, onSelect }) {
  return (
    <button className="project-card" onClick={() => onSelect(project)}>
      <ProjectArt project={project} />
      <div className="project-card-body">
        <span className="eyebrow">{category(project)}</span>
        <div className="project-title-row">
          <h3>{project.title}</h3>
          <span className="round-arrow">
            <Icon name="chevron" size={18} />
          </span>
        </div>
        <p>{project.tech_stack}</p>
      </div>
    </button>
  );
}
export function ProjectSheet({ project, onClose }) {
  const ref = useRef(null);
  const y = useMotionValue(0);
  const reduced = useReducedMotion();
  const opacity = useMotionValue(0);
  const gesture = useRef(null);
  const animation = useRef(null);
  const revision = useRef(0);
  function close(velocity = 0) {
    const version = ++revision.current;
    animation.current?.stop();
    if (!reduced)
      animation.current = animate(y, Math.max(24, y.get()), {
        type: "spring",
        stiffness: 400,
        damping: 40,
        velocity,
      });
    animate(opacity, 0, { duration: 0.15 }).then(() => {
      if (version === revision.current) onClose();
    });
  }
  useLayoutEffect(() => {
    const trigger = document.activeElement;
    animate(opacity, 1, { duration: 0.15 });
    if (!reduced) {
      y.set(24);
      animation.current = animate(y, 0, {
        type: "spring",
        stiffness: 400,
        damping: 40,
      });
    }
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = before;
      animation.current?.stop();
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, []);
  return (
    <div
      ref={ref}
      className="sheet-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <motion.article className="sheet" style={{ y, opacity }}>
        <div className="sheet-close-bar">
          <button
            autoFocus
            className="icon-button sheet-close"
            aria-label="Close project details"
            onClick={() => close()}
          >
            <Icon name="close" />
          </button>
        </div>
        <div
          className="sheet-grab"
          aria-hidden="true"
          onPointerDown={(e) => {
            if (reduced) return;
            ++revision.current;
            animation.current?.stop();
            animate(opacity, 1, { duration: 0.1 });
            e.currentTarget.setPointerCapture(e.pointerId);
            gesture.current = {
              origin: e.clientY - y.get(),
              samples: [{ position: e.clientY, time: e.timeStamp }],
            };
          }}
          onPointerMove={(e) => {
            const g = gesture.current;
            if (!g) return;
            const offset = e.clientY - g.origin;
            y.set(offset < 0 ? offset * 0.15 : offset);
            g.samples.push({ position: e.clientY, time: e.timeStamp });
            g.samples = g.samples.filter(
              (sample) => e.timeStamp - sample.time < 100,
            );
          }}
          onPointerUp={(e) => {
            const g = gesture.current;
            if (!g) return;
            gesture.current = null;
            const sample = g.samples[0];
            const velocity =
              ((e.clientY - sample.position) /
                Math.max(1, e.timeStamp - sample.time)) *
              1000;
            if (velocity >= 0 && y.get() + velocity * 0.18 > 140)
              close(velocity);
            else
              animation.current = animate(y, 0, {
                type: "spring",
                stiffness: 400,
                damping: 34,
                velocity,
              });
          }}
          onPointerCancel={() => {
            gesture.current = null;
            animation.current = animate(y, 0, {
              type: "spring",
              stiffness: 400,
              damping: 40,
            });
          }}
        >
          <span />
        </div>
        <ProjectArt project={project} />
        <div className="sheet-content">
          <p className="eyebrow">{category(project)}</p>
          <h2 id="sheet-title">{project.title}</h2>
          <p>{project.description}</p>
          <div className="tags-list">
            {project.tech_stack.split(",").map((t) => (
              <span className="tag" key={t}>
                {t.trim()}
              </span>
            ))}
          </div>
          <div className="hero-actions">
            {project.live_url && (
              <a
                className="btn btn-primary"
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
              >
                Open project <Icon name="up" size={16} />
              </a>
            )}
            {project.github_url && (
              <a
                className="btn btn-secondary"
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub <Icon name="up" size={16} />
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
