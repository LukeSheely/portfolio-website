import React, { useState } from "react";
import { submitContact } from "../api";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const result = await submitContact(form);
      if (result.error) {
        setStatus({ type: "error", text: result.error });
      } else {
        setStatus({ type: "success", text: result.message });
        setForm({ name: "", email: "", message: "" });
      }
    } catch {
      setStatus({ type: "error", text: "Something went wrong. Please try again." });
    }

    setSubmitting(false);
  };

  return (
    <div className="page">
      <h1 className="page-title">Contact</h1>
      <p className="page-subtitle">
        Send me a message and I'll get back to you.
      </p>

      {status && (
        <div className={`alert alert-${status.type}`}>{status.text}</div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      <div style={{ marginTop: 32, color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
        <p>
          <strong>AWS Integration:</strong> This form saves your message to a
          PostgreSQL database (hosted on RDS) and sends an email notification
          via AWS SES.
        </p>
      </div>
    </div>
  );
}

export default Contact;
