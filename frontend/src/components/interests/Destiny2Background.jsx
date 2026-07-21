import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * Vow of the Disciple mood — a fan-made, non-commercial homage.
 * The sunken Pyramid interior: a central Pyramid with a rising light beam,
 * obelisk monoliths bearing glowing symbol cartouches (the raid's read-the-
 * symbols mechanic), drifting hex glyphs, a scan sweep, and pervading dark.
 * All artwork is original/abstract — evocative, not lifted from the game.
 */

const TEAL = "53, 224, 192";
const BRIGHT = "170, 250, 224";
const GREEN = "150, 230, 110";
const MAGENTA = "214, 74, 150";

// Abstract "glyph": a few strokes inside the unit box [-0.5, 0.5].
function makeRune() {
  const grid = [-0.32, 0, 0.32];
  const pt = () => [grid[(Math.random() * 3) | 0], grid[(Math.random() * 3) | 0]];
  const segs = [];
  const n = 2 + ((Math.random() * 3) | 0);
  for (let i = 0; i < n; i++) segs.push([pt(), pt()]);
  if (Math.random() < 0.5) segs.push([[0, -0.34], [0, 0.34]]); // spine
  return segs;
}

// Draw a hexagonal cartouche with an inner glyph at (x, y), radius r.
function drawSymbol(ctx, x, y, r, rune, color, alpha, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.strokeStyle = `rgba(${color}, ${alpha})`;

  // hex frame
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // inner glyph
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.strokeStyle = `rgba(${BRIGHT}, ${alpha})`;
  ctx.beginPath();
  rune.forEach(([a, b]) => {
    ctx.moveTo(a[0] * r * 1.4, a[1] * r * 1.4);
    ctx.lineTo(b[0] * r * 1.4, b[1] * r * 1.4);
  });
  ctx.stroke();
  ctx.restore();
}

function Destiny2Background() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.last = 0;
      const gCount = W < 700 ? 10 : 18;
      state.glyphs = Array.from({ length: gCount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 10 + Math.random() * 16,
        speed: 6 + Math.random() * 16,
        rune: makeRune(),
        phase: Math.random() * Math.PI * 2,
        rot: (Math.random() - 0.5) * 0.5,
        green: Math.random() < 0.25,
      }));

      const oCount = W < 700 ? 3 : 5;
      state.obelisks = Array.from({ length: oCount }, (_, i) => {
        const x = (W * (i + 0.5)) / oCount + (Math.random() - 0.5) * 40;
        const h = H * (0.34 + Math.random() * 0.16);
        return {
          x,
          w: 26 + Math.random() * 16,
          h,
          rune: makeRune(),
          phase: Math.random() * Math.PI * 2,
          shift: 0.4 + Math.random() * 0.6,
        };
      });

      state.beams = state.obelisks.map((o) => ({ x: o.x, phase: Math.random() * 6 }));
    },
    frame: (ctx, { t, W, H, state }) => {
      const dt = Math.min(0.05, t - (state.last || t));
      state.last = t;

      // obsidian base with a cold teal depth
      ctx.fillStyle = "#03080a";
      ctx.fillRect(0, 0, W, H);
      const depth = ctx.createRadialGradient(W * 0.5, H * 0.72, 0, W * 0.5, H * 0.72, Math.max(W, H) * 0.8);
      depth.addColorStop(0, `rgba(${TEAL}, 0.10)`);
      depth.addColorStop(0.45, "rgba(14, 40, 44, 0.28)");
      depth.addColorStop(1, "rgba(2, 4, 6, 0)");
      ctx.fillStyle = depth;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      // volumetric light beams descending from above
      state.beams.forEach((b) => {
        const flick = 0.5 + 0.5 * Math.sin(t * 0.8 + b.phase);
        const bw = 70;
        const beam = ctx.createLinearGradient(b.x, 0, b.x, H);
        beam.addColorStop(0, `rgba(${TEAL}, ${0.06 * flick})`);
        beam.addColorStop(0.6, `rgba(${TEAL}, ${0.03 * flick})`);
        beam.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = beam;
        ctx.fillRect(b.x - bw / 2, 0, bw, H);
      });

      // central Pyramid with a rising beam
      const cx = W * 0.5;
      const baseY = H * 0.82;
      const s = Math.min(W, H) * 0.3;
      const apexY = baseY - s * 1.15;
      const pulse = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.1));

      // rising beam from apex
      const rb = ctx.createLinearGradient(cx, apexY, cx, 0);
      rb.addColorStop(0, `rgba(${BRIGHT}, ${0.22 * pulse})`);
      rb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rb;
      ctx.fillRect(cx - 9, 0, 18, apexY);

      // dark pyramid body
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(cx, apexY);
      ctx.lineTo(cx - s, baseY);
      ctx.lineTo(cx + s, baseY);
      ctx.closePath();
      const body = ctx.createLinearGradient(cx, apexY, cx, baseY);
      body.addColorStop(0, "rgba(10, 26, 28, 0.95)");
      body.addColorStop(1, "rgba(2, 8, 10, 0.98)");
      ctx.fillStyle = body;
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      // glowing edges + inner seam
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgba(${TEAL}, ${pulse})`;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, apexY);
      ctx.lineTo(cx, baseY);
      ctx.strokeStyle = `rgba(${TEAL}, ${pulse * 0.5})`;
      ctx.stroke();
      // apex glow
      const ag = ctx.createRadialGradient(cx, apexY, 0, cx, apexY, 40);
      ag.addColorStop(0, `rgba(${BRIGHT}, ${0.6 * pulse})`);
      ag.addColorStop(1, `rgba(${TEAL}, 0)`);
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(cx, apexY, 40, 0, Math.PI * 2);
      ctx.fill();

      // obelisk monoliths with symbol cartouches
      state.obelisks.forEach((o) => {
        const topY = H - o.h;
        ctx.globalCompositeOperation = "source-over";
        const og = ctx.createLinearGradient(0, topY, 0, H);
        og.addColorStop(0, "rgba(8, 22, 24, 0.9)");
        og.addColorStop(1, "rgba(2, 6, 8, 0.95)");
        ctx.fillStyle = og;
        ctx.fillRect(o.x - o.w / 2, topY, o.w, o.h);

        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${TEAL}, 0.4)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(o.x - o.w / 2, topY, o.w, o.h);

        const gl = 0.4 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.6 + o.phase));
        drawSymbol(ctx, o.x, topY + o.w * 0.9, o.w * 0.42, o.rune, TEAL, gl);
      });

      // drifting glyph cartouches
      state.glyphs.forEach((g) => {
        g.y -= g.speed * dt;
        g.phase += dt * 1.3;
        if (g.y < -30) {
          g.y = H + 30;
          g.x = Math.random() * W;
        }
        const a = 0.2 + 0.45 * (0.5 + 0.5 * Math.sin(g.phase));
        drawSymbol(ctx, g.x, g.y, g.r, g.rune, g.green ? GREEN : TEAL, a, g.rot);
      });

      // scan sweep
      const scanY = ((t * 0.12) % 1) * H;
      const scan = ctx.createLinearGradient(0, scanY - 70, 0, scanY + 70);
      scan.addColorStop(0, `rgba(${TEAL}, 0)`);
      scan.addColorStop(0.5, `rgba(${TEAL}, 0.08)`);
      scan.addColorStop(1, `rgba(${TEAL}, 0)`);
      ctx.fillStyle = scan;
      ctx.fillRect(0, scanY - 70, W, 140);

      // faint pervading-darkness bloom, drifting
      const mx = W * (0.5 + 0.35 * Math.sin(t * 0.23));
      const my = H * (0.4 + 0.2 * Math.cos(t * 0.19));
      const pd = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
      pd.addColorStop(0, `rgba(${MAGENTA}, 0.06)`);
      pd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pd;
      ctx.beginPath();
      ctx.arc(mx, my, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";

      // vignette
      const vig = ctx.createRadialGradient(cx, H * 0.55, Math.min(W, H) * 0.2, cx, H * 0.55, Math.max(W, H) * 0.72);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(1, 3, 4, 0.8)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default Destiny2Background;
