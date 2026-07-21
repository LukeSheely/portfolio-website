import React, { useEffect, useState } from "react";
import Reveal from "../components/Reveal";
import { useBackground } from "../context/BackgroundContext";
import { fetchInterests } from "../api";

// Shown if the API is unreachable or the interests table isn't seeded yet.
const FALLBACK_INTERESTS = [
  {
    id: "destiny2",
    title: "Destiny 2",
    accent: "#d9b877",
    tag: "Raiding · PvP · Lore",
    blurb: "Endgame raids and Crucible.",
    theme: "destiny2",
    description:
      "Deep in the endgame — day-one raid attempts, weekly clears, Trials weekends, and tumbling down the lore rabbit-hole. The Traveler's got me hooked.",
  },
  {
    id: "osu",
    title: "osu!",
    accent: "#ff66ab",
    tag: "Rhythm · Aim · Reaction",
    blurb: "Clicking circles to music.",
    theme: "osu",
    description:
      "The rhythm game that wrecked my reaction time in the best way. Chasing cleaner aim, higher accuracy, and that flow state where the map just reads itself.",
  },
  {
    id: "wakesurf",
    title: "Wakesurfing",
    accent: "#41b8e0",
    tag: "Summers on the water",
    blurb: "Trading the desk for the lake.",
    theme: "wakesurf",
    description:
      "Warm-weather reset button — chasing the wake, carving lines, and generally being anywhere near open water when the weather allows.",
  },
];

const KNOWN_THEMES = ["destiny2", "osu", "wakesurf"];

function Interests() {
  const { setTheme } = useBackground();
  const [interests, setInterests] = useState(FALLBACK_INTERESTS);
  const [flipped, setFlipped] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchInterests()
      .then((data) => {
        if (alive && Array.isArray(data) && data.length > 0) setInterests(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Always restore the noir background when leaving the page.
  useEffect(() => () => setTheme("noir"), [setTheme]);

  // Map an interest's theme to a background key (unknown → noir).
  const bgFor = (it) => (KNOWN_THEMES.includes(it.theme) ? it.theme : "noir");

  const activate = (it) => setTheme(bgFor(it));

  // Touch/click: toggle the flip and drive the background too.
  const toggle = (it) => {
    if (flipped === it.id) {
      setFlipped(null);
      setTheme("noir");
    } else {
      setFlipped(it.id);
      setTheme(bgFor(it));
    }
  };

  return (
    <div className="page">
      <Reveal>
        <p className="eyebrow">outside the terminal</p>
        <h1 className="page-title">Interests</h1>
        <p className="page-subtitle">
          Hover a card to flip it — and watch the background shift into its world.
        </p>
      </Reveal>

      <div className="interests-grid" onMouseLeave={() => setTheme("noir")}>
        {interests.map((it, i) => (
          <Reveal key={it.id} delay={i * 90}>
            <div
              className={`interest-card${flipped === it.id ? " is-flipped" : ""}`}
              style={{ "--ac": it.accent || "#6fe7c1" }}
              onMouseEnter={() => activate(it)}
              onClick={() => toggle(it)}
            >
              <div className="interest-card__inner">
                <div className="interest-card__face interest-card__front">
                  <span className="interest-card__tag">{it.tag}</span>
                  <div className="interest-card__spacer" />
                  <h3 className="interest-card__title">{it.title}</h3>
                  <p className="interest-card__blurb">{it.blurb}</p>
                  <span className="interest-card__hint">hover / tap →</span>
                </div>
                <div className="interest-card__face interest-card__back">
                  <span className="interest-card__tag">{it.title}</span>
                  <div className="interest-card__spacer" />
                  <p className="interest-card__desc">{it.description}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default Interests;
