import React, { useEffect } from "react";
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
import Interests from "./pages/Interests";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

function RouteReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const names = {
      "/": "Creative Developer",
      "/projects": "Selected Work",
      "/contact": "Contact",
      "/interests": "Off the Clock",
      "/admin": "Admin",
    };
    document.title = "Luke Sheely — " + (names[pathname] || "Portfolio");
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteReset />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="navbar container">
        <NavLink to="/" className="navbar-brand" aria-label="Luke Sheely home">
          luke sheely
          <span className="brand-star" aria-hidden="true">
            ✳
          </span>
        </NavLink>
        <span className="nav-note">DEVELOPER &amp; CURIOUS HUMAN</span>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/projects">Work</NavLink>
          <NavLink to="/contact" className="nav-contact">
            Let’s talk <span aria-hidden="true">↗</span>
          </NavLink>
        </nav>
      </header>
      <main id="main" className="container" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <div className="page">
                <p className="eyebrow">404 / A little off course</p>
                <h1 className="page-title">
                  Let’s head <em>home.</em>
                </h1>
                <Link className="btn btn-primary" to="/">
                  Back to home ↗
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer container">
        <Link className="footer-name" to="/">
          Luke Sheely<span>✳</span>
        </Link>
        <p>Built with curiosity. Always in progress.</p>
        <div>
          <a
            href="https://github.com/LukeSheely"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <Link to="/admin">Admin</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </BrowserRouter>
  );
}
