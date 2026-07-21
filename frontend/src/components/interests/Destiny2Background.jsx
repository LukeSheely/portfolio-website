import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * A title-screen-flavored cosmic scene: a large luminous sphere (a
 * Traveler-style orb) hanging over a drifting starfield and nebula, with a
 * warm city glow on the horizon and soft god-rays. Fan-made and entirely
 * original artwork — it channels the "big sphere over a starry sky" mood,
 * it does not reproduce any specific copyrighted title-screen frame, logo,
 * or UI.
 */

function Destiny2Background() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.last = 0;

      const starCount = W < 700 ? 90 : 180;
      state.stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.85,
        r: Math.random() < 0.85 ? 0.6 + Math.random() * 0.9 : 1.4 + Math.random() * 1.2,
        base: 0.3 + Math.random() * 0.7,
        tw: 0.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        drift: 1 + Math.random() * 3,
      }));

      state.nebula = [
        { x: W * 0.25, y: H * 0.3, r: W * 0.4, c: [60, 110, 190], vx: 4, vy: 2 },
        { x: W * 0.75, y: H * 0.22, r: W * 0.34, c: [120, 80, 190], vx: -3, vy: 3 },
        { x: W * 0.6, y: H * 0.55, r: W * 0.42, c: [210, 150, 80], vx: 2, vy: -2 },
      ];

      // Traveler-style orb: fixed craters give it a pocked surface.
      state.orb = { x: W * 0.5, y: H * 0.4, R: Math.min(W, H) * 0.2 };
      state.craters = Array.from({ length: 16 }, () => {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * 0.82;
        return { a, d, r: 0.06 + Math.random() * 0.16, dark: Math.random() < 0.6 };
      });
    },
    frame: (ctx, { t, W, H, state }) => {
      const dt = Math.min(0.05, t - (state.last || t));
      state.last = t;

      // deep-space vertical gradient, warming toward the horizon
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#05060f");
      sky.addColorStop(0.45, "#0a1226");
      sky.addColorStop(0.8, "#14172e");
      sky.addColorStop(1, "#3a2418");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      // nebula clouds, slowly drifting
      state.nebula.forEach((n) => {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -n.r) n.x = W + n.r;
        if (n.x > W + n.r) n.x = -n.r;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.c[0]}, ${n.c[1]}, ${n.c[2]}, 0.16)`);
        g.addColorStop(1, `rgba(${n.c[0]}, ${n.c[1]}, ${n.c[2]}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // starfield with a slow drift + twinkle
      state.stars.forEach((s) => {
        s.x -= s.drift * dt;
        if (s.x < 0) s.x = W;
        const tw = s.base * (0.55 + 0.45 * Math.sin(t * s.tw + s.phase));
        ctx.fillStyle = `rgba(233, 240, 255, ${tw})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const orb = state.orb;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.6);

      // god-rays fanning down from the orb
      const rays = 7;
      for (let i = 0; i < rays; i++) {
        const ang = Math.PI * 0.5 + (i - (rays - 1) / 2) * 0.16 + Math.sin(t * 0.2 + i) * 0.01;
        const len = H;
        const spread = 0.03;
        const x1 = orb.x + Math.cos(ang - spread) * len;
        const y1 = orb.y + Math.sin(ang - spread) * len;
        const x2 = orb.x + Math.cos(ang + spread) * len;
        const y2 = orb.y + Math.sin(ang + spread) * len;
        const g = ctx.createRadialGradient(orb.x, orb.y, orb.R, orb.x, orb.y, len);
        g.addColorStop(0, `rgba(200, 220, 255, ${0.05 + 0.02 * pulse})`);
        g.addColorStop(1, "rgba(200, 220, 255, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(orb.x, orb.y);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // orb halo
      const halo = ctx.createRadialGradient(orb.x, orb.y, orb.R * 0.6, orb.x, orb.y, orb.R * 2.2);
      halo.addColorStop(0, `rgba(180, 205, 255, ${0.28 + 0.12 * pulse})`);
      halo.addColorStop(1, "rgba(150, 180, 255, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.R * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";

      // the sphere body
      const bodyGrad = ctx.createRadialGradient(
        orb.x - orb.R * 0.3, orb.y - orb.R * 0.35, orb.R * 0.1,
        orb.x, orb.y, orb.R
      );
      bodyGrad.addColorStop(0, "#f2f5ff");
      bodyGrad.addColorStop(0.6, "#c9d2e6");
      bodyGrad.addColorStop(0.92, "#8f9ab8");
      bodyGrad.addColorStop(1, "#5a6480");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.R, 0, Math.PI * 2);
      ctx.fill();

      // pocked surface (clipped to the sphere)
      ctx.save();
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.R, 0, Math.PI * 2);
      ctx.clip();
      state.craters.forEach((c) => {
        const px = orb.x + Math.cos(c.a) * c.d * orb.R;
        const py = orb.y + Math.sin(c.a) * c.d * orb.R;
        const cr = c.r * orb.R;
        const g = ctx.createRadialGradient(px, py, 0, px, py, cr);
        if (c.dark) {
          g.addColorStop(0, "rgba(70, 78, 100, 0.5)");
          g.addColorStop(1, "rgba(70, 78, 100, 0)");
        } else {
          g.addColorStop(0, "rgba(255, 255, 255, 0.5)");
          g.addColorStop(1, "rgba(255, 255, 255, 0)");
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, cr, 0, Math.PI * 2);
        ctx.fill();
      });
      // soft terminator shadow on the lower-left
      const term = ctx.createRadialGradient(
        orb.x + orb.R * 0.5, orb.y + orb.R * 0.55, orb.R * 0.2,
        orb.x + orb.R * 0.2, orb.y + orb.R * 0.3, orb.R * 1.4
      );
      term.addColorStop(0, "rgba(10, 14, 30, 0)");
      term.addColorStop(1, "rgba(10, 14, 30, 0.55)");
      ctx.fillStyle = term;
      ctx.fillRect(orb.x - orb.R, orb.y - orb.R, orb.R * 2, orb.R * 2);
      ctx.restore();

      // crisp rim highlight
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(210, 225, 255, ${0.5 * pulse + 0.3})`;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.R - 1, Math.PI * 1.15, Math.PI * 1.9);
      ctx.stroke();

      // horizon: cloud band + warm city glow beneath the orb
      const glow = ctx.createRadialGradient(orb.x, H, 0, orb.x, H, W * 0.7);
      glow.addColorStop(0, "rgba(240, 170, 90, 0.35)");
      glow.addColorStop(0.4, "rgba(210, 120, 60, 0.18)");
      glow.addColorStop(1, "rgba(210, 120, 60, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);

      ctx.globalCompositeOperation = "source-over";
      // cloud band silhouette
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) {
        const y = H * 0.86 + Math.sin(x * 0.006 + t * 0.15) * 12 + Math.sin(x * 0.013 + 1.3) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      const cloud = ctx.createLinearGradient(0, H * 0.8, 0, H);
      cloud.addColorStop(0, "rgba(20, 16, 26, 0.6)");
      cloud.addColorStop(1, "rgba(8, 6, 12, 0.95)");
      ctx.fillStyle = cloud;
      ctx.fill();

      // vignette
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(2, 3, 8, 0.7)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default Destiny2Background;
