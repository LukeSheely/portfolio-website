import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProjects, fetchTags } from "../api";
import Reveal from "../components/Reveal";
import ProjectCard from "../components/ProjectCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [tags, setTags] = useState([]);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let active = true;
    fetchProjects(true)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid projects");
        if (active) {
          setFeatured(data);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });
    fetchTags()
      .then((data) => {
        if (active && Array.isArray(data)) setTags(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-topline">
          <p className="eyebrow">INDEPENDENT MIND. HANDS-ON BUILDER.</p>
          <span className="edition">PORTFOLIO — VOL. 01</span>
        </div>
        <Reveal>
          <h1 id="hero-title" className="hero-title">
            Curiosity.
            <br />
            <span className="hero-second">
              Made <em>tangible.</em>
              <span className="hero-star" aria-hidden="true">
                ✳
              </span>
            </span>
          </h1>
        </Reveal>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#selected-work">
            <span aria-hidden="true">↓</span>SCROLL TO EXPLORE
          </a>
          <Reveal delay={100} className="hero-intro">
            <p>
              I’m Luke — a computer science student turning interesting problems
              into thoughtful software.
            </p>
            <div className="intro-links">
              <Link to="/projects" className="text-link">
                Discover my work ↗
              </Link>
              <span>BASED IN WASHINGTON</span>
            </div>
          </Reveal>
        </div>
      </section>
      <div className="discipline-strip" aria-label="Areas of focus">
        <span>SOFTWARE DEVELOPMENT</span>
        <b aria-hidden="true">✳</b>
        <span>MACHINE LEARNING</span>
        <b aria-hidden="true">✳</b>
        <span>IDEAS INTO REALITY</span>
        <b aria-hidden="true">✳</b>
      </div>
      <section className="work-section" id="selected-work">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">01 / A FEW THINGS I’VE BUILT</p>
            <h2>
              Selected <em>work.</em>
            </h2>
          </div>
          <Link className="text-link" to="/projects">
            All projects ↗
          </Link>
        </Reveal>
        {state === "loading" && (
          <p className="loading-state" role="status">
            Opening the collection…
          </p>
        )}
        {state === "error" && (
          <p className="alert alert-error" role="alert">
            Projects couldn’t load. Please refresh, or{" "}
            <a href="https://github.com/LukeSheely">explore my GitHub ↗</a>.
          </p>
        )}
        {state === "ready" && featured.length === 0 && (
          <p>
            New work is on the way.{" "}
            <Link to="/projects">Explore all projects ↗</Link>
          </p>
        )}
        <div className="project-grid">
          {featured.map((project, i) => (
            <Reveal key={project.id} delay={i * 50}>
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-section" aria-labelledby="about-heading">
        <div className="about-portrait">
          <img
            src="/headshot.png"
            alt="Luke Sheely"
            loading="lazy"
            width="372"
            height="347"
          />
          <span className="portrait-label">THE PERSON BEHIND THE PROJECTS</span>
          <span className="portrait-mark" aria-hidden="true">
            ✳
          </span>
        </div>
        <Reveal className="about-copy">
          <p className="eyebrow">02 / A LITTLE ABOUT ME</p>
          <h2 id="about-heading">
            Serious about building.
            <br />
            <em>Always curious.</em>
          </h2>
          <p>
            I’m a third-year Computer Science student at Western Washington
            University, exploring the space where software development meets
            machine learning.
          </p>
          <p>
            From training models to shipping web apps, I like understanding how
            things work — then making something of my own.
          </p>
          <div className="availability">
            <span aria-hidden="true" />
            Open to summer 2027 internships
          </div>
        </Reveal>
      </section>
      <section className="toolkit-section">
        <p className="eyebrow">03 / TOOLS OF THE TRADE</p>
        <div className="toolkit-list">
          {(tags.length
            ? tags.map((t) => t.name)
            : ["Python", "React", "SQL", "AWS", "Git"]
          ).map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </section>
      <Reveal as="section" className="contact-banner">
        <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
        <Link to="/contact">
          Let’s make
          <br />
          <em>something great.</em>
          <span aria-hidden="true">↗</span>
        </Link>
        <p>A project, an opportunity, or just a good conversation.</p>
      </Reveal>
    </div>
  );
}
