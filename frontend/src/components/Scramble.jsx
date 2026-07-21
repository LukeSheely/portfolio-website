import React, { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#абв△○▷◇01";

/**
 * Renders `text`, but on mount it decodes in from random glyphs — each
 * character locks into place left-to-right over `duration` ms. Honors
 * prefers-reduced-motion by showing the final text immediately.
 */
function Scramble({ text, duration = 1100, className = "", ...rest }) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }

    const total = text.length;
    let startTs;

    const step = (ts) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      const revealed = progress * total;

      let out = "";
      for (let i = 0; i < total; i++) {
        const ch = text[i];
        if (ch === " ") {
          out += " ";
        } else if (i < revealed) {
          out += ch;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(out);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, duration]);

  return (
    <span className={className} {...rest}>
      {display}
    </span>
  );
}

export default Scramble;
