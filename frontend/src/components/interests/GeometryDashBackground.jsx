import React, { useRef } from "react";
import useAnimatedCanvas from "./useAnimatedCanvas";

/**
 * Geometry Dash "Nine Circles"-flavored scene: a beat-pulsing background
 * that flashes through a color cycle, a scrolling corridor of spikes, and
 * the signature wave gamemode — a little triangle weaving a glowing 45°
 * zigzag trail. Original geometry and animation; no game assets used.
 */

const BEAT = 0.42; // seconds per beat (~143 BPM)
const HUES = [190, 305, 330, 265, 158, 220]; // cyan, magenta, pink, violet, green, blue

function spike(ctx, ax, ay, bx, by, tipX, tipY, hue, pulse) {
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(tipX, tipY);
  ctx.closePath();
  ctx.fillStyle = "#0b0912";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `hsla(${hue}, 90%, 62%, ${0.35 + pulse * 0.45})`;
  ctx.stroke();
}

function strokeTrail(ctx, trail) {
  if (trail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
  ctx.stroke();
}

function GeometryDashBackground() {
  const ref = useRef(null);

  useAnimatedCanvas(ref, {
    setup: (ctx, { W, H, state }) => {
      state.last = 0;
      state.scroll = 0;
      state.speed = Math.max(240, W * 0.3); // px/sec (also the wave's vertical speed → 45°)
      state.step = 44;
      state.trail = [];
      state.waveX = W * 0.32;
      state.waveY = H * 0.5;
      state.dir = -1;
      state.top = H * 0.37; // wave upper bound
      state.bot = H * 0.63; // wave lower bound
    },
    frame: (ctx, { t, W, H, state }) => {
      const dt = Math.min(0.05, t - (state.last || t));
      state.last = t;
      state.scroll += state.speed * dt;

      const beatIdx = Math.floor(t / BEAT);
      const beatPhase = (t % BEAT) / BEAT;
      const pulse = Math.pow(1 - beatPhase, 2.2); // 1 on the beat, decays
      const hue = HUES[beatIdx % HUES.length];
      const hue2 = HUES[(beatIdx + 1) % HUES.length];

      // background + color flash on the beat
      ctx.fillStyle = "#08060d";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `hsla(${hue}, 90%, 55%, ${0.1 + pulse * 0.22})`;
      ctx.fillRect(0, 0, W, H);

      // pulsing concentric squares (background objects)
      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.rotate(t * 0.05);
      for (let i = 4; i >= 1; i--) {
        const s = Math.min(W, H) * 0.15 * i * (1 + pulse * 0.05);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${(0.05 + pulse * 0.09) / i})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
      }
      ctx.restore();

      // scrolling spike corridor
      const step = state.step;
      const off = state.scroll % step;
      const topBase = H * 0.3;
      const botBase = H * 0.7;
      for (let x = -off - step; x < W + step; x += step) {
        const wx = x + state.scroll;
        const th = topBase + Math.sin(wx * 0.01) * H * 0.045;
        const bh = botBase + Math.sin(wx * 0.011 + 1.7) * H * 0.045;
        spike(ctx, x, 0, x + step, 0, x + step / 2, th, hue, pulse); // top, points down
        spike(ctx, x, H, x + step, H, x + step / 2, bh, hue, pulse); // bottom, points up
      }

      // wave motion: constant-slope zigzag, flips at the bounds
      state.waveY += state.dir * state.speed * dt;
      if (state.waveY < state.top) {
        state.waveY = state.top;
        state.dir = 1;
      } else if (state.waveY > state.bot) {
        state.waveY = state.bot;
        state.dir = -1;
      }

      // trail scrolls left with the world; new point pinned at the wave
      for (let i = 0; i < state.trail.length; i++) state.trail[i].x -= state.speed * dt;
      state.trail.push({ x: state.waveX, y: state.waveY });
      while (state.trail.length && state.trail[0].x < -20) state.trail.shift();

      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = `hsla(${hue2}, 100%, 65%, 0.45)`;
      ctx.lineWidth = 11;
      strokeTrail(ctx, state.trail);
      ctx.strokeStyle = `hsla(${hue2}, 100%, 88%, 0.95)`;
      ctx.lineWidth = 3;
      strokeTrail(ctx, state.trail);

      // the wave icon
      const r = 12;
      ctx.save();
      ctx.translate(state.waveX, state.waveY);
      ctx.rotate(state.dir < 0 ? -0.6 : 0.6);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(-r * 0.8, -r * 0.8);
      ctx.lineTo(-r * 0.8, r * 0.8);
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue2}, 100%, 90%, 1)`;
      ctx.shadowColor = `hsla(${hue2}, 100%, 70%, 0.9)`;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();

      ctx.globalCompositeOperation = "source-over";

      // vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(3, 2, 6, 0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    },
  });

  return <canvas ref={ref} className="interest-canvas" aria-hidden="true" />;
}

export default GeometryDashBackground;
