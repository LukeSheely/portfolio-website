import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Icon from "./components/Icon";
function Shell() {
  const { pathname } = useLocation();
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("appearance")
        ? localStorage.getItem("appearance") === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("appearance", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${pathname === "/" ? "Portfolio" : pathname.slice(1).replace(/^./, (c) => c.toUpperCase())} — Luke Sheely`;
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="monogram">ls.</span>
          <span>
            Luke Sheely
          </span>
        </Link>
        <div className="top-actions">
          <span className="location">
            <Icon name="pin" size={14} /> Bellingham, WA
          </span>
          <a
            className="header-github text-link"
            href="https://github.com/LukeSheely"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <Icon name="up" size={14} />
          </a>
          <button
            className="icon-button"
            onClick={() => setDark(!dark)}
            aria-label={`Switch to ${dark ? "light" : "dark"} appearance`}
          >
            <Icon name={dark ? "sun" : "moon"} />
          </button>
        </div>
      </header>
      <main id="main" className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="*"
            element={
              <div className="page">
                <h1>Nothing here just yet.</h1>
                <Link className="btn btn-primary" to="/">
                  Back to overview
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <nav className="dock" aria-label="Main navigation">
        {[
          ["/", "Overview", "home"],
          ["/projects", "Projects", "grid"],
          ["/contact", "Contact", "message"],
        ].map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon name={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
