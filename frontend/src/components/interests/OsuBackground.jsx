import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * osu! feel: a blurred, colorful gameplay background (soft drifting bokeh)
 * with hit circles that appear under a shrinking approach ring and pop on
 * the beat, in the signature osu! pink.
 */

const PINK = "255, 102, 171";
const COLORS = [
  [255, 102, 171],
  [120, 160, 255],
  [180, 120, 255],
  [255, 170, 120],
  [120, 230, 220],
];

function OsuBackground() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.last = 0;
      state.spawn = 0;
      state.hits = [];
      state.bokeh = Array.from({ length: 9 }, () => {
        const c = COLORS[(Math.random() * COLORS.length) | 0];
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: 160 + Math.random() * 240,
          vx: (Math.random() - 0.5) * 18,
          vy: (Math.random() - 0.5) * 18,
          c,
        };
      });
    },
    frame: (ctx, { t, W, H, state }) => {
      const dt = Math.min(0.05, t - (state.last || t));
      state.last = t;

      // dark base
      ctx.fillStyle = "#0b0710";
      ctx.fillRect(0, 0, W, H);

      // blurred bokeh (soft additive gradients read as out-of-focus gameplay)
      ctx.globalCompositeOperation = "lighter";
      state.bokeh.forEach((b) => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < -b.r) b.x = W + b.r;
        if (b.x > W + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = H + b.r;
        if (b.y > H + b.r) b.y = -b.r;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(${b.c[0]}, ${b.c[1]}, ${b.c[2]}, 0.22)`);
        g.addColorStop(1, `rgba(${b.c[0]}, ${b.c[1]}, ${b.c[2]}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";

      // darken so foreground circles read (the "dim" slider)
      ctx.fillStyle = "rgba(6, 4, 10, 0.45)";
      ctx.fillRect(0, 0, W, H);

      // spawn hit circles on a steady beat
      state.spawn -= dt;
      if (state.spawn <= 0) {
        state.spawn = 0.52;
        state.hits.push({
          x: 80 + Math.random() * (W - 160),
          y: 100 + Math.random() * (H - 200),
          age: 0,
          r: 34 + Math.random() * 10,
        });
      }

      const APPROACH = 0.62;
      const LIFE = 0.95;
      for (let i = state.hits.length - 1; i >= 0; i--) {
        const h = state.hits[i];
        h.age += dt;
        if (h.age > LIFE) {
          state.hits.splice(i, 1);
          continue;
        }
        if (h.age < APPROACH) {
          const p = h.age / APPROACH;
          // hit circle
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${PINK}, ${0.18 + p * 0.35})`;
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.stroke();
          // approach ring shrinking in
          const ar = h.r * (1 + (1 - p) * 2.4);
          ctx.beginPath();
          ctx.arc(h.x, h.y, ar, 0, Math.PI * 2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = `rgba(${PINK}, ${0.5 * (0.4 + p)})`;
          ctx.stroke();
        } else {
          // pop: expand + fade
          const p = (h.age - APPROACH) / (LIFE - APPROACH);
          const pr = h.r * (1 + p * 0.9);
          ctx.beginPath();
          ctx.arc(h.x, h.y, pr, 0, Math.PI * 2);
          ctx.lineWidth = 4 * (1 - p);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * (1 - p)})`;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.r * (1 - p * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${PINK}, ${0.4 * (1 - p)})`;
          ctx.fill();
        }
      }
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default OsuBackground;
