import React, { useState } from "react";
import { submitContact } from "../api";
import Icon from "../components/Icon";
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const result = await submitContact(form);
      if (result.error) throw new Error(result.error);
      if (!result.message)
        throw new Error(
          "Your message could not be confirmed. Please try again.",
        );
      setStatus({ type: "success", text: result.message });
      setForm({ name: "", email: "", message: "" });
    } catch (e) {
      setStatus({
        type: "error",
        text: e.message || "Could not send your message. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="page">
      <p className="eyebrow">LET’S CONNECT</p>
      <h1 className="page-title">Start a conversation.</h1>
      <p className="page-subtitle">
        An interesting opportunity, an idea, or just a hello. My inbox is open.
      </p>
      <div className="contact-layout">
        <form className="card" onSubmit={submit}>
          {status && (
            <div role="status" className={`alert alert-${status.type}`}>
              {status.text}
            </div>
          )}
          {[
            ["name", "Name", "text"],
            ["email", "Email address", "email", "you@example.com"],
            ["message", "Your message", "textarea", "What’s on your mind?"],
          ].map(([name, label, type, placeholder]) => (
            <div className="form-group" key={name}>
              <label htmlFor={name}>{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={name}
                  name={name}
                  required
                  value={form[name]}
                  placeholder={placeholder}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                />
              ) : (
                <input
                  id={name}
                  name={name}
                  autoComplete={name}
                  required
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                />
              )}
            </div>
          ))}
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Sending…" : "Send message"}
            <Icon name="up" size={17} />
          </button>
        </form>
        <aside className="contact-aside">
          <span className="app-icon blue">
            <Icon name="message" />
          </span>
          <h2>Let’s build something good.</h2>
          <p>
            I’m a fourth-year computer science student at Western Washington
            University, interested in machine learning and full-stack
            development.
          </p>
          <p style={{ marginTop: 16 }}>
            Currently open to summer 2027 internships.
          </p>
          <a
            className="text-link"
            href="https://github.com/LukeSheely"
            target="_blank"
            rel="noreferrer"
          >
            Find me on GitHub <Icon name="up" size={16} />
          </a>
        </aside>
      </div>
    </div>
  );
}
