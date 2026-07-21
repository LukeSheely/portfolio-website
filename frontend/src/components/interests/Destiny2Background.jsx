import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * Fan-made, non-commercial homage to the Vow of the Disciple key-art mood:
 * a dark monolith silhouette carved with glowing runes, radial god-rays
 * behind it, a molten pit at its base with rising embers, and red haze.
 * All artwork here is original/abstract — it evokes the scene's composition
 * and palette, it does not reproduce Bungie's art or their raid symbols.
 */

const MOLTEN = "255, 138, 44";
const AMBER = "255, 176, 82";
const HOT = "255, 232, 190";
const EMBER = "255, 150, 70";

function Destiny2Background() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.last = 0;

      // Rune "branches" carved down the monolith spine (original marks).
      state.branches = Array.from({ length: 8 }, (_, i) => ({
        at: 0.08 + (i / 8) * 0.84 + (Math.random() - 0.5) * 0.03,
        dir: Math.random() < 0.5 ? -1 : 1,
        len: 0.4 + Math.random() * 0.6,
        block: Math.random() < 0.5,
        phase: Math.random() * Math.PI * 2,
      }));

      // Rising embers from the pit.
      const eCount = W < 700 ? 26 : 46;
      state.embers = Array.from({ length: eCount }, () => ({
        x: W * 0.5 + (Math.random() - 0.5) * W * 0.28,
        y: H * (0.7 + Math.random() * 0.25),
        vy: 12 + Math.random() * 34,
        size: 0.8 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 10,
      }));

      state.rays = Array.from({ length: 12 }, (_, i) => ({
        a: (Math.PI * 2 * i) / 12 + Math.random() * 0.1,
        w: 0.05 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      }));
    },
    frame: (ctx, { t, W, H, state }) => {
      const dt = Math.min(0.05, t - (state.last || t));
      state.last = t;

      const cx = W * 0.5;
      const pitY = H * 0.82;
      const flick = 0.82 + 0.18 * Math.sin(t * 6.0) * Math.sin(t * 2.3);

      // cool grey smoke up top, warming toward the molten base
      ctx.fillStyle = "#08080a";
      ctx.fillRect(0, 0, W, H);
      const haze = ctx.createLinearGradient(0, 0, 0, H);
      haze.addColorStop(0, "rgba(46, 48, 56, 0.55)");
      haze.addColorStop(0.4, "rgba(40, 30, 30, 0.32)");
      haze.addColorStop(0.75, "rgba(70, 26, 14, 0.28)");
      haze.addColorStop(1, "rgba(120, 40, 14, 0.2)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      // radial god-rays from behind the monolith's upper third
      const ox = cx;
      const oy = H * 0.26;
      state.rays.forEach((r) => {
        const ang = r.a + Math.sin(t * 0.15 + r.phase) * 0.03;
        const spread = r.w * (0.7 + 0.3 * Math.sin(t * 0.6 + r.phase));
        const len = Math.max(W, H) * 1.3;
        const x1 = ox + Math.cos(ang - spread) * len;
        const y1 = oy + Math.sin(ang - spread) * len;
        const x2 = ox + Math.cos(ang + spread) * len;
        const y2 = oy + Math.sin(ang + spread) * len;
        const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, len);
        const al = 0.05 * flick;
        grd.addColorStop(0, `rgba(${MOLTEN}, ${al})`);
        grd.addColorStop(0.5, `rgba(${MOLTEN}, ${al * 0.4})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();
      });

      // molten pit glow
      const pit = ctx.createRadialGradient(cx, pitY, 0, cx, pitY, W * 0.55);
      pit.addColorStop(0, `rgba(${HOT}, ${0.9 * flick})`);
      pit.addColorStop(0.12, `rgba(${MOLTEN}, ${0.8 * flick})`);
      pit.addColorStop(0.4, `rgba(190, 40, 14, ${0.5 * flick})`);
      pit.addColorStop(1, "rgba(120, 20, 8, 0)");
      ctx.fillStyle = pit;
      ctx.fillRect(0, 0, W, H);

      // monolith geometry
      const mw = Math.max(90, Math.min(W, H) * 0.15);
      const topY = H * 0.05;
      const botY = pitY;
      const halfTop = mw * 0.5;
      const halfBot = mw * 0.62;

      // Rhulk's arena floor ring — a glowing orange circle at the base
      ctx.save();
      ctx.translate(cx, pitY);
      ctx.scale(1, 0.32);
      [mw * 2.6, mw * 1.7].forEach((rr, i) => {
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.lineWidth = (i === 0 ? 3 : 2) / 0.32;
        ctx.strokeStyle = `rgba(${MOLTEN}, ${(i === 0 ? 0.5 : 0.35) * flick})`;
        ctx.stroke();
      });
      ctx.restore();

      // bright core light escaping from the base slit, up the monolith
      const beam = ctx.createLinearGradient(cx, botY, cx, topY);
      beam.addColorStop(0, `rgba(${HOT}, ${0.7 * flick})`);
      beam.addColorStop(0.5, `rgba(${MOLTEN}, ${0.15 * flick})`);
      beam.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(cx - mw * 0.12, topY, mw * 0.24, botY - topY);

      ctx.globalCompositeOperation = "source-over";

      // faint serpent coiled at the base (Xivu Arath's brood), abstract
      ctx.strokeStyle = "rgba(6, 3, 3, 0.85)";
      ctx.lineWidth = mw * 0.14;
      ctx.lineCap = "round";
      [-1, 1].forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(cx + s * mw * 0.2, botY + mw * 0.05);
        ctx.bezierCurveTo(
          cx + s * mw * 1.4, botY - mw * 0.1,
          cx + s * mw * 1.1, botY - mw * 0.7 + Math.sin(t * 0.8) * 6,
          cx + s * mw * 1.9, botY - mw * 0.45
        );
        ctx.stroke();
      });

      // monolith: capstone + tapered body silhouette
      const capH = mw * 0.42;
      const capHalf = mw * 0.72;
      const bodyTop = topY + capH;
      ctx.beginPath();
      ctx.moveTo(cx - capHalf, topY);
      ctx.lineTo(cx + capHalf, topY);
      ctx.lineTo(cx + capHalf, bodyTop);
      ctx.lineTo(cx + halfTop, bodyTop);
      ctx.lineTo(cx + halfBot, botY);
      ctx.lineTo(cx - halfBot, botY);
      ctx.lineTo(cx - halfTop, bodyTop);
      ctx.lineTo(cx - capHalf, bodyTop);
      ctx.closePath();
      const body = ctx.createLinearGradient(cx, topY, cx, botY);
      body.addColorStop(0, "#0c0706");
      body.addColorStop(0.7, "#140a08");
      body.addColorStop(1, "#1c0d08");
      ctx.fillStyle = body;
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      // warm rim light on the edges + capstone
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(${MOLTEN}, ${0.5 * flick})`;
      ctx.beginPath();
      ctx.moveTo(cx - capHalf, topY);
      ctx.lineTo(cx + capHalf, topY);
      ctx.moveTo(cx - halfTop, bodyTop);
      ctx.lineTo(cx - halfBot, botY);
      ctx.moveTo(cx + halfTop, bodyTop);
      ctx.lineTo(cx + halfBot, botY);
      ctx.stroke();
      // capstone score line + notch
      ctx.strokeStyle = `rgba(${AMBER}, ${0.4 * flick})`;
      ctx.beginPath();
      ctx.moveTo(cx - capHalf * 0.8, bodyTop - 3);
      ctx.lineTo(cx + capHalf * 0.8, bodyTop - 3);
      ctx.stroke();

      // central slit
      ctx.strokeStyle = `rgba(${HOT}, ${0.55 * flick})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, bodyTop + mw * 0.04);
      ctx.lineTo(cx, botY - mw * 0.1);
      ctx.stroke();

      // carved runes: spine branches with glow
      const spineTop = bodyTop + mw * 0.12;
      const spineBot = botY - mw * 0.2;
      ctx.lineCap = "round";
      state.branches.forEach((b) => {
        const y = spineTop + (spineBot - spineTop) * b.at;
        const half = mw * (0.16 + (b.at * 0.06));
        const glow = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.4 + b.phase));
        ctx.strokeStyle = `rgba(${AMBER}, ${glow})`;
        ctx.lineWidth = 2.4;
        // horizontal branch off the slit
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx + b.dir * half * b.len, y);
        ctx.stroke();
        // end tick or block
        const ex = cx + b.dir * half * b.len;
        if (b.block) {
          ctx.fillStyle = `rgba(${AMBER}, ${glow})`;
          ctx.fillRect(ex - 3, y - 3, 6, 6);
        } else {
          ctx.beginPath();
          ctx.moveTo(ex, y - half * 0.35);
          ctx.lineTo(ex, y + half * 0.35);
          ctx.stroke();
        }
      });

      // rising embers
      state.embers.forEach((e) => {
        e.y -= e.vy * dt;
        e.x += e.drift * dt;
        e.phase += dt * 3;
        if (e.y < H * 0.28) {
          e.y = H * (0.78 + Math.random() * 0.15);
          e.x = cx + (Math.random() - 0.5) * W * 0.28;
        }
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(e.phase));
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3);
        g.addColorStop(0, `rgba(${EMBER}, ${tw})`);
        g.addColorStop(1, `rgba(${EMBER}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";

      // drifting dark smoke + vignette
      const smoke = ctx.createRadialGradient(cx, H * 0.5, Math.min(W, H) * 0.25, cx, H * 0.45, Math.max(W, H) * 0.7);
      smoke.addColorStop(0, "rgba(0,0,0,0)");
      smoke.addColorStop(1, "rgba(6, 3, 2, 0.82)");
      ctx.fillStyle = smoke;
      ctx.fillRect(0, 0, W, H);
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default Destiny2Background;
