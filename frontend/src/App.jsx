import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AuroraBackground from "./components/AuroraBackground";
import ShaderAurora from "./components/ShaderAurora";

function App() {
  // Pointer interactions: glass-card spotlight + 3D tilt, and magnetic buttons.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Tilt/spotlight/magnetism are cursor affordances — skip on touch so
    // buttons and cards don't jump around under a finger during scroll.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;
    const TILT = 6; // max degrees
    let activeCard = null;

    const clearTilt = (card) => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };

    const onMove = (e) => {
      // --- glass cards ---
      const card = e.target.closest?.(".card");
      if (activeCard && card !== activeCard) {
        clearTilt(activeCard);
        activeCard = null;
      }
      if (card) {
        activeCard = card;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
        if (!reduced) {
          card.style.setProperty("--ry", `${(px - 0.5) * 2 * TILT}deg`);
          card.style.setProperty("--rx", `${-(py - 0.5) * 2 * TILT}deg`);
        }
      }

      // --- magnetic buttons ---
      if (reduced) return;
      document.querySelectorAll("[data-magnetic]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        const radius = Math.max(r.width, r.height) / 2 + 70;
        if (dist < radius) {
          const s = 1 - dist / radius;
          el.style.transform = `translate(${dx * 0.28 * s}px, ${dy * 0.28 * s}px)`;
        } else {
          el.style.transform = "";
        }
      });
    };

    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <BrowserRouter>
      <div className="scroll-progress" aria-hidden="true" />
      <AuroraBackground />
      <ShaderAurora />

      <nav className="navbar">
        <div className="container">
          <NavLink to="/" className="navbar-brand">
            <span className="dot" aria-hidden="true" />
            Luke Sheely
          </NavLink>
          <ul className="navbar-links">
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects">Projects</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
            <li>
              <NavLink to="/admin">Admin</NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
