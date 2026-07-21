import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * A "star map / director"-flavored scene: glowing destination nodes
 * scattered across a starfield with faint orbital arcs, a planet arcing
 * along the bottom, and a selection reticle that drifts between nodes.
 * Fan-made and entirely original artwork — it channels the navigation-map
 * mood, it does not reproduce any game's UI, node layout, icons, or logos.
 */

const COLORS = {
  teal: [90, 210, 200],
  gold: [230, 182, 96],
  blue: [96, 156, 232],
  violet: [156, 116, 224],
  white: [214, 226, 255],
  orange: [232, 146, 84],
};

// Balanced layout of destination nodes (fractions of W / H).
const NODE_LAYOUT = [
  { x: 0.18, y: 0.26, r: 20, c: "teal", sats: 2 },
  { x: 0.5, y: 0.17, r: 26, c: "gold", sats: 1 },
  { x: 0.82, y: 0.24, r: 18, c: "blue", sats: 0 },
  { x: 0.33, y: 0.46, r: 15, c: "white", sats: 0 },
  { x: 0.67, y: 0.44, r: 22, c: "violet", sats: 2 },
  { x: 0.5, y: 0.62, r: 17, c: "orange", sats: 1 },
  { x: 0.12, y: 0.6, r: 14, c: "blue", sats: 0 },
  { x: 0.88, y: 0.58, r: 16, c: "teal", sats: 1 },
];

function Destiny2Background() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.last = 0;

      const starCount = W < 700 ? 90 : 170;
      state.stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() < 0.85 ? 0.5 + Math.random() * 0.8 : 1.3 + Math.random(),
        base: 0.3 + Math.random() * 0.6,
        tw: 0.5 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2,
        drift: 1 + Math.random() * 2.5,
      }));

      state.nodes = NODE_LAYOUT.map((n, i) => ({
        x: n.x * W,
        y: n.y * H,
        r: n.r * (W < 700 ? 0.8 : 1),
        col: COLORS[n.c],
        phase: Math.random() * Math.PI * 2,
        sats: Array.from({ length: n.sats }, (_, s) => ({
          dist: n.r * (W < 700 ? 0.8 : 1) + 8 + s * 7,
          ang: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.8,
          size: 1.5 + Math.random(),
        })),
        idx: i,
      }));

      // planet arcing across the bottom
      state.planet = { x: W * 0.5, y: H * 1.22, R: Math.max(W, H) * 0.8 };
      // selection cursor eases between nodes
      state.cur = { x: state.nodes[0].x, y: state.nodes[0].y };
    },
    frame: (ctx, { t, W, H, state }) => {
      const dt = Math.min(0.05, t - (state.last || t));
      state.last = t;

      // deep-space gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#05060f");
      sky.addColorStop(0.55, "#0a1024");
      sky.addColorStop(1, "#0c1630");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      const p = state.planet;

      ctx.globalCompositeOperation = "lighter";

      // faint nebula wash
      const neb = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W * 0.5);
      neb.addColorStop(0, "rgba(70, 90, 170, 0.10)");
      neb.addColorStop(1, "rgba(70, 90, 170, 0)");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, W, H);

      // starfield
      state.stars.forEach((s) => {
        s.x -= s.drift * dt;
        if (s.x < 0) s.x = W;
        const tw = s.base * (0.55 + 0.45 * Math.sin(t * s.tw + s.phase));
        ctx.fillStyle = `rgba(226, 234, 255, ${tw})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // large orbital arcs centered on the planet, passing through the node band
      ctx.lineWidth = 1;
      [0.62, 0.78, 0.95].forEach((f, i) => {
        ctx.strokeStyle = `rgba(120, 160, 220, ${0.12 - i * 0.02})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.R * f, p.R * f * 0.92, 0, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      });

      // thin connector lines from each node toward the planet hub
      ctx.strokeStyle = "rgba(120, 160, 220, 0.08)";
      state.nodes.forEach((n) => {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(p.x, p.y - p.R * 0.72);
        ctx.stroke();
      });

      ctx.globalCompositeOperation = "source-over";

      // planet body
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.R, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(p.x, p.y - p.R * 0.4, p.R * 0.2, p.x, p.y, p.R);
      pg.addColorStop(0, "#16305a");
      pg.addColorStop(0.6, "#0b1a34");
      pg.addColorStop(1, "#060c18");
      ctx.fillStyle = pg;
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      // atmosphere rim on the visible top edge
      const rimY = p.y - p.R;
      const atmo = ctx.createLinearGradient(0, rimY - 40, 0, rimY + 60);
      atmo.addColorStop(0, "rgba(120, 190, 255, 0)");
      atmo.addColorStop(0.55, "rgba(120, 190, 255, 0.28)");
      atmo.addColorStop(1, "rgba(120, 190, 255, 0)");
      ctx.fillStyle = atmo;
      ctx.fillRect(0, rimY - 40, W, 100);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(160, 210, 255, 0.5)";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.R, p.R, 0, Math.PI * 1.16, Math.PI * 1.84);
      ctx.stroke();

      // destination nodes
      state.nodes.forEach((n) => {
        const [r, g, b] = n.col;
        const pulse = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.4 + n.phase));

        // glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2.6);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 * pulse})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.6, 0, Math.PI * 2);
        ctx.fill();

        // core disc
        const disc = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, 0, n.x, n.y, n.r);
        disc.addColorStop(0, `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, 0.95)`);
        disc.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.55)`);
        ctx.fillStyle = disc;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // outer ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.8 * pulse})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
        ctx.stroke();

        // tick marks around the ring (HUD detail)
        for (let k = 0; k < 8; k++) {
          const a = (Math.PI / 4) * k + t * 0.15;
          const r1 = n.r + 8;
          const r2 = n.r + 12;
          ctx.beginPath();
          ctx.moveTo(n.x + Math.cos(a) * r1, n.y + Math.sin(a) * r1);
          ctx.lineTo(n.x + Math.cos(a) * r2, n.y + Math.sin(a) * r2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * pulse})`;
          ctx.stroke();
        }

        // orbiting satellites
        n.sats.forEach((sat) => {
          sat.ang += sat.speed * dt;
          const sx = n.x + Math.cos(sat.ang) * sat.dist;
          const sy = n.y + Math.sin(sat.ang) * sat.dist * 0.6;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
          ctx.beginPath();
          ctx.arc(sx, sy, sat.size, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // selection reticle — eases between nodes like a cursor
      const active = state.nodes[Math.floor(t / 3.2) % state.nodes.length];
      state.cur.x += (active.x - state.cur.x) * 0.05;
      state.cur.y += (active.y - state.cur.y) * 0.05;
      const rr = active.r + 18;
      const spin = t * 0.6;
      ctx.strokeStyle = "rgba(220, 235, 255, 0.85)";
      ctx.lineWidth = 2;
      for (let q = 0; q < 4; q++) {
        const a0 = spin + (Math.PI / 2) * q + 0.3;
        const a1 = a0 + 0.5;
        ctx.beginPath();
        ctx.arc(state.cur.x, state.cur.y, rr, a0, a1);
        ctx.stroke();
      }
      // pulsing lock ring
      const lock = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.strokeStyle = `rgba(220, 235, 255, ${0.3 * lock})`;
      ctx.beginPath();
      ctx.arc(state.cur.x, state.cur.y, rr + 5 * lock, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalCompositeOperation = "source-over";

      // vignette
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.42, Math.min(W, H) * 0.32, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(2, 3, 8, 0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default Destiny2Background;
