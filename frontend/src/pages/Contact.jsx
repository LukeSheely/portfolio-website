import React, { useState } from "react";
import { submitContact } from "../api";
import Reveal from "../components/Reveal";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const result = await submitContact(form);
      if (result.error) throw new Error(result.error);
      setStatus({
        type: "success",
        text:
          result.message ||
          "Thanks for reaching out. Your message is on its way.",
      });
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        text:
          error.message || "Your message couldn’t be sent. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="page contact-page">
      <Reveal className="contact-copy">
        <p className="eyebrow">GOOD THINGS START WITH A CONVERSATION</p>
        <h1 className="page-title">
          Hello
          <br />
          <em>there.</em>
          <span className="contact-star" aria-hidden="true">
            ✳
          </span>
        </h1>
        <p className="page-subtitle">
          Have an interesting problem, a project in mind, or an opportunity to
          share? I’d love to hear about it.
        </p>
        <div className="availability">
          <span aria-hidden="true" />
          Open to summer 2027 internships
        </div>
        <a
          className="text-link"
          href="https://github.com/LukeSheely"
          target="_blank"
          rel="noreferrer"
        >
          Find me on GitHub ↗
        </a>
      </Reveal>
      <Reveal className="contact-form-wrap" delay={80}>
        <form onSubmit={handleSubmit} className="contact-form">
          <p className="eyebrow">LEAVE A NOTE</p>
          <div className="form-group">
            <label htmlFor="name">01 / Your name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              maxLength={100}
              placeholder="What should I call you?"
              value={form.name}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">02 / Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">03 / What’s on your mind?</label>
            <textarea
              id="message"
              name="message"
              maxLength={5000}
              placeholder="Tell me a little about it…"
              value={form.message}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          {status && (
            <div
              className={"alert alert-" + status.type}
              role={status.type === "error" ? "alert" : "status"}
            >
              {status.text}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send message ↗"}
          </button>
        </form>
      </Reveal>
    </div>
  );
}
