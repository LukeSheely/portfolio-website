import React, { useEffect, useState } from "react";
import { fetchInterests } from "../api";
import Reveal from "../components/Reveal";

export default function Interests() {
  const [interests, setInterests] = useState([]);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let active = true;
    fetchInterests()
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Invalid interests");
        if (active) {
          setInterests(data);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="page">
      <p className="eyebrow">OUTSIDE THE EDITOR</p>
      <h1 className="page-title">
        Off the <em>clock.</em>
      </h1>
      <p className="page-subtitle">A few things that keep life interesting.</p>
      {state === "loading" && <p role="status">Loading interests…</p>}
      {state === "error" && (
        <p role="alert">
          Interests couldn’t load. Please refresh to try again.
        </p>
      )}
      <div className="interests-grid">
        {interests.map((it, i) => (
          <Reveal as="article" className="interest-card" key={it.id}>
            <span className="eyebrow">
              {String(i + 1).padStart(2, "0")} / {it.tag}
            </span>
            <h2>{it.title}</h2>
            <p>{it.blurb}</p>
            <details>
              <summary>More about this</summary>
              <p>{it.description}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
