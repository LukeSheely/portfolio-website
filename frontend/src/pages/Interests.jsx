import React, { useEffect, useState } from "react";
import Reveal from "../components/Reveal";
import { useBackground } from "../context/BackgroundContext";

const INTERESTS = [
  {
    id: "destiny2",
    title: "Destiny 2",
    accent: "#3ce0cd",
    tag: "Raiding · PvP · Lore",
    blurb: "Endgame raids and Crucible.",
    back:
      "Deep in the endgame — day-one raid attempts, weekly clears, and a soft spot for the Vow of the Disciple encounter design. Equal parts mechanics, coordination, and lore rabbit-holes.",
  },
  {
    id: "osu",
    title: "osu!",
    accent: "#ff66ab",
    tag: "Rhythm · Aim · Reaction",
    blurb: "Clicking circles to music.",
    back:
      "The rhythm game that wrecked my reaction time in the best way. Chasing cleaner aim, higher accuracy, and that flow state where the map just reads itself.",
  },
  {
    id: "wakesurf",
    title: "Wakesurfing",
    accent: "#41b8e0",
    tag: "Summers on the water",
    blurb: "Trading the desk for the lake.",
    back:
      "Warm-weather reset button — chasing the wake, carving lines, and generally being anywhere near open water when the weather allows.",
  },
];

function Interests() {
  const { setTheme } = useBackground();
  const [flipped, setFlipped] = useState(null);

  // Always restore the noir background when leaving the page.
  useEffect(() => () => setTheme("noir"), [setTheme]);

  const activate = (id) => setTheme(id);

  // Touch/click: toggle the flip and drive the background too.
  const toggle = (id) => {
    if (flipped === id) {
      setFlipped(null);
      setTheme("noir");
    } else {
      setFlipped(id);
      setTheme(id);
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
        {INTERESTS.map((it, i) => (
          <Reveal key={it.id} delay={i * 90}>
            <div
              className={`interest-card${flipped === it.id ? " is-flipped" : ""}`}
              style={{ "--ac": it.accent }}
              onMouseEnter={() => activate(it.id)}
              onClick={() => toggle(it.id)}
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
                  <p className="interest-card__desc">{it.back}</p>
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
