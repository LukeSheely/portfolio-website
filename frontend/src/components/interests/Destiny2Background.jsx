import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * Vow of the Disciple mood: obsidian pyramid interior, teal "language of
 * the deep" glyphs drifting upward, a pulsing pyramid glyph, and a slow
 * scan sweep. Abstract/original glyphs — evocative, not a reproduction.
 */

// Build a rune from segments on a 3x3 lattice.
function makeRune() {
  const nodes = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) nodes.push([i - 1, j - 1]);
  const segs = [];
  const n = 3 + ((Math.random() * 3) | 0);
  for (let k = 0; k < n; k++) {
    const a = nodes[(Math.random() * 9) | 0];
    const b = nodes[(Math.random() * 9) | 0];
    if (a !== b) segs.push([a, b]);
  }
  return segs;
}

function Destiny2Background() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.last = 0;
      const count = W < 700 ? 16 : 30;
      state.glyphs = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 12 + Math.random() * 20,
        speed: 8 + Math.random() * 22,
        rune: makeRune(),
        phase: Math.random() * Math.PI * 2,
        rot: (Math.random() - 0.5) * 0.4,
      }));
    },
    frame: (ctx, { t, W, H, state }) => {
      const dt = Math.min(0.05, t - (state.last || t));
      state.last = t;

      // obsidian base with a faint purple depth
      ctx.fillStyle = "#05070b";
      ctx.fillRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.62, 0, W * 0.5, H * 0.62, Math.max(W, H) * 0.75);
      bg.addColorStop(0, "rgba(40, 22, 66, 0.55)");
      bg.addColorStop(0.5, "rgba(12, 30, 40, 0.35)");
      bg.addColorStop(1, "rgba(4, 6, 10, 0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      // central pyramid, breathing teal
      const cx = W * 0.5;
      const cy = H * 0.58;
      const s = Math.min(W, H) * 0.26;
      const pulse = 0.4 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.2));
      ctx.strokeStyle = `rgba(60, 224, 205, ${pulse})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx - s * 0.9, cy + s * 0.7);
      ctx.lineTo(cx + s * 0.9, cy + s * 0.7);
      ctx.closePath();
      ctx.stroke();
      // inner sigil line
      ctx.strokeStyle = `rgba(150, 120, 230, ${pulse * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.55);
      ctx.lineTo(cx, cy + s * 0.7);
      ctx.moveTo(cx - s * 0.45, cy + s * 0.05);
      ctx.lineTo(cx + s * 0.45, cy + s * 0.05);
      ctx.stroke();

      // drifting glyphs
      state.glyphs.forEach((g) => {
        g.y -= g.speed * dt;
        g.phase += dt * 1.4;
        if (g.y < -40) {
          g.y = H + 40;
          g.x = Math.random() * W;
        }
        const a = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(g.phase));
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rot);
        ctx.scale(g.size / 2, g.size / 2);
        ctx.lineWidth = 2.4 / (g.size / 2);
        ctx.strokeStyle = `rgba(70, 232, 210, ${a})`;
        ctx.beginPath();
        g.rune.forEach(([p, q]) => {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
        });
        ctx.stroke();
        ctx.restore();
      });

      // scan sweep
      const scanY = ((t * 0.14) % 1) * H;
      const scan = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      scan.addColorStop(0, "rgba(60, 224, 205, 0)");
      scan.addColorStop(0.5, "rgba(60, 224, 205, 0.10)");
      scan.addColorStop(1, "rgba(60, 224, 205, 0)");
      ctx.fillStyle = scan;
      ctx.fillRect(0, scanY - 60, W, 120);

      ctx.globalCompositeOperation = "source-over";

      // edge darkening
      const vig = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.2, cx, cy, Math.max(W, H) * 0.7);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(2, 3, 6, 0.75)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default Destiny2Background;
