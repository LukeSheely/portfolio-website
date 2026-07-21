import React, { useEffect, useState } from "react";
import { useBackground } from "../context/BackgroundContext";
import Destiny2Background from "./interests/Destiny2Background";
import OsuBackground from "./interests/OsuBackground";
import WakesurfBackground from "./interests/WakesurfBackground";

const MAP = {
  destiny2: Destiny2Background,
  osu: OsuBackground,
  wakesurf: WakesurfBackground,
};

/**
 * Renders the active interest background over the noir aurora and
 * cross-fades it in/out. Keeps the outgoing scene mounted briefly so the
 * fade-out is visible before unmounting.
 */
function InterestBackground() {
  const { theme } = useBackground();
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (theme && theme !== "noir") {
      setActive(theme);
      setVisible(true);
    } else {
      setVisible(false);
      const t = setTimeout(() => setActive(null), 650);
      return () => clearTimeout(t);
    }
  }, [theme]);

  const Scene = active ? MAP[active] : null;

  return (
    <div className="interest-bg" style={{ opacity: visible ? 1 : 0 }} aria-hidden="true">
      {Scene && <Scene key={active} />}
    </div>
  );
}

export default InterestBackground;
