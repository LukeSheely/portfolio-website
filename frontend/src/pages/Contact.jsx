import React, { useState } from "react";
import { submitContact } from "../api";
import { links } from "../content";
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
      <h1 className="page-title">Contact</h1>
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
          </button>
        </form>
        <aside className="contact-aside">
          <dl className="contact-list">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${links.email}`}>{links.email}</a>
            </dd>
            <dt>LinkedIn</dt>
            <dd>
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                linkedin.com/in/luke-sheely
              </a>
            </dd>
            <dt>GitHub</dt>
            <dd>
              <a href={links.github} target="_blank" rel="noreferrer">
                github.com/LukeSheely
              </a>
            </dd>
          </dl>
        </aside>
      </div>
    </div>
  );
}
